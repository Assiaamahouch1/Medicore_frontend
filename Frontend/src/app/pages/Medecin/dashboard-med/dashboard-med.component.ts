import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  RendezvousService, 
  DashboardStats, 
  ConsultationStats 
} from '../../../../services/rendezvous.service';
import { PatientService } from '../../../../services/patient.service';
import { AuthService, AuthAdmin } from '../../../../services/auth.service';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexLegend,
  ApexFill,
  ApexTooltip,
  ApexPlotOptions,
  ApexResponsive,
  ApexNonAxisChartSeries,
  ApexGrid
} from 'ng-apexcharts';

export type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  legend: ApexLegend;
  fill: ApexFill;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  colors: string[];
};

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  colors: string[];
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-dashboard-med',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard-med.component.html',
})
export class DashboardMedComponent implements OnInit {
  @ViewChild('lineChart') lineChart!: ChartComponent;
  @ViewChild('donutChart') donutChart!: ChartComponent;

  // User info
  user: AuthAdmin = {
    nom: '',
    prenom: '',
    username: '',
    numTel: '',
    role: '',
    avatar: '',
    actif: true,
    cabinetId: 0,
  };

  // Dashboard stats
  stats: DashboardStats = {
    patientsEnAttenteSalle: 0,
    rdvConfirmesAujourdhui: 0,
    rdvEnAttenteConfirmation: 0,
    consultationsAujourdhui: 0,
    totalRdvJour: 0
  };

  totalPatients: number = 0;
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  // Chart options
  lineChartOptions!: LineChartOptions;
  donutChartOptions!: DonutChartOptions;
  
  // Additional stats
  tauxPresence: number = 0;
  tauxConfirmation: number = 0;
  today: Date = new Date();

  constructor(
    private rdvService: RendezvousService,
    private patientService: PatientService,
    private authService: AuthService
  ) {
    this.initLineChart();
    this.initDonutChart();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentAuth().subscribe({
      next: (user) => {
        this.user = user;
        if (user && user.cabinetId) {
          this.loadDashboardData();
        } else {
          this.hasError = true;
          this.errorMessage = 'Cabinet non trouvé. Veuillez contacter l\'administrateur.';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Erreur chargement user:', err);
        this.hasError = true;
        this.errorMessage = 'Impossible de charger les informations utilisateur.';
        this.isLoading = false;
      }
    });
  }

  loadDashboardData(): void {
    if (!this.user.cabinetId) {
      console.warn('cabinetId non défini');
      this.hasError = true;
      this.errorMessage = 'Cabinet ID non défini.';
      this.isLoading = false;
      return;
    }

    this.hasError = false;
    this.errorMessage = '';
    let loadedCount = 0;
    const totalRequests = 4;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalRequests) {
        this.calculateAdditionalStats();
        this.isLoading = false;
      }
    };

    // Load dashboard stats
    this.rdvService.getDashboardStats(this.user.cabinetId).subscribe({
      next: (data) => {
        console.log('Dashboard stats reçues:', data);
        this.stats = data || {
          patientsEnAttenteSalle: 0,
          rdvConfirmesAujourdhui: 0,
          rdvEnAttenteConfirmation: 0,
          consultationsAujourdhui: 0,
          totalRdvJour: 0
        };
        checkComplete();
      },
      error: (err) => {
        console.error('Erreur stats dashboard:', err);
        console.error('CabinetId:', this.user.cabinetId);
        this.stats = {
          patientsEnAttenteSalle: 0,
          rdvConfirmesAujourdhui: 0,
          rdvEnAttenteConfirmation: 0,
          consultationsAujourdhui: 0,
          totalRdvJour: 0
        };
        checkComplete();
      }
    });

    // Load total patients
    this.patientService.getAll(this.user.cabinetId).subscribe({
      next: (patients) => {
        this.totalPatients = patients ? patients.length : 0;
        checkComplete();
      },
      error: (err) => {
        console.error('Erreur patients:', err);
        this.totalPatients = 0;
        checkComplete();
      }
    });

    // Load consultations week stats for line chart
    this.rdvService.getConsultationsWeekStats(this.user.cabinetId).subscribe({
      next: (data) => {
        console.log('Consultations week stats reçues:', data);
        if (data && data.length > 0) {
          this.updateLineChart(data);
        } else {
          // Données par défaut si aucune donnée
          this.updateLineChart([]);
        }
        checkComplete();
      },
      error: (err) => {
        console.error('Erreur consultations week:', err);
        console.error('CabinetId:', this.user.cabinetId);
        this.updateLineChart([]);
        checkComplete();
      }
    });

    // Load types repartition for donut chart
    this.rdvService.getTypesRepartition(this.user.cabinetId).subscribe({
      next: (data) => {
        console.log('Types repartition reçus:', data);
        if (data && Object.keys(data).length > 0) {
          this.updateDonutChart(data);
        } else {
          // Données par défaut si aucune donnée
          this.updateDonutChart({});
        }
        checkComplete();
      },
      error: (err) => {
        console.error('Erreur types repartition:', err);
        console.error('CabinetId:', this.user.cabinetId);
        this.updateDonutChart({});
        checkComplete();
      }
    });
  }

  private calculateAdditionalStats(): void {
    // Calculer le taux de présence
    if (this.stats.totalRdvJour > 0) {
      const totalPresents = this.stats.patientsEnAttenteSalle + this.stats.consultationsAujourdhui;
      this.tauxPresence = Math.round((totalPresents / this.stats.totalRdvJour) * 100);
    } else {
      this.tauxPresence = 0;
    }

    // Calculer le taux de confirmation
    if (this.stats.totalRdvJour > 0) {
      this.tauxConfirmation = Math.round((this.stats.rdvConfirmesAujourdhui / this.stats.totalRdvJour) * 100);
    } else {
      this.tauxConfirmation = 0;
    }
  }

  private initLineChart(): void {
    this.lineChartOptions = {
      series: [
        {
          name: 'Consultations',
          data: [0, 0, 0, 0, 0, 0, 0]
        }
      ],
      chart: {
        type: 'area',
        height: 310,
        fontFamily: 'Outfit, sans-serif',
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      colors: ['#465fff'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            colors: '#667085',
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#667085',
            fontSize: '12px'
          }
        }
      },
      legend: {
        show: false
      },
      tooltip: {
        theme: 'light',
        x: {
          show: true
        }
      },
      grid: {
        borderColor: '#e4e7ec',
        strokeDashArray: 4
      }
    };
  }

  private initDonutChart(): void {
    this.donutChartOptions = {
      series: [],
      chart: {
        type: 'donut',
        height: 320,
        fontFamily: 'Outfit, sans-serif'
      },
      labels: [],
      colors: ['#465fff', '#7592ff', '#36bffa', '#fb6514', '#12b76a', '#f79009', '#f04438'],
legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '13px',
    markers: {
      offsetX: 0,
      offsetY: 0
    },
    itemMargin: {
      horizontal: 10,
      vertical: 8
    }
  },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                color: '#667085'
              },
              value: {
                show: true,
                fontSize: '24px',
                fontWeight: 600,
                color: '#101828'
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '14px',
                color: '#667085'
              }
            }
          }
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 280
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ],
      tooltip: {
        theme: 'light'
      }
    };
  }

  private updateLineChart(data: ConsultationStats[]): void {
    if (!data || data.length === 0) {
      // Données par défaut pour les 7 derniers jours
      const defaultDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      this.lineChartOptions = {
        ...this.lineChartOptions,
        series: [
          {
            name: 'Consultations',
            data: [0, 0, 0, 0, 0, 0, 0]
          }
        ],
        xaxis: {
          ...this.lineChartOptions.xaxis,
          categories: defaultDays
        }
      };
      return;
    }

    const values = data.map(d => d.count || 0);
    const labels = data.map(d => d.jour || '');

    this.lineChartOptions = {
      ...this.lineChartOptions,
      series: [
        {
          name: 'Consultations',
          data: values
        }
      ],
      xaxis: {
        ...this.lineChartOptions.xaxis,
        categories: labels.length > 0 ? labels : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      }
    };
  }

  private updateDonutChart(data: { [key: string]: number }): void {
    if (!data || Object.keys(data).length === 0) {
      // Données par défaut si aucune donnée
      this.donutChartOptions = {
        ...this.donutChartOptions,
        series: [1],
        labels: ['Aucune donnée']
      };
    } else {
      const labels = Object.keys(data);
      const values = Object.values(data).map(v => v || 0);
      
      this.donutChartOptions = {
        ...this.donutChartOptions,
        series: values,
        labels: labels
      };
    }
  }
}
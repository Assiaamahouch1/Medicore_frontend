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

  // Chart options
  lineChartOptions!: LineChartOptions;
  donutChartOptions!: DonutChartOptions;

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
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Erreur chargement user:', err);
        this.isLoading = false;
      }
    });
  }

  loadDashboardData(): void {
    if (!this.user.cabinetId) {
      console.warn('cabinetId non défini');
      this.isLoading = false;
      return;
    }

    // Load dashboard stats
    this.rdvService.getDashboardStats(this.user.cabinetId).subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => console.error('Erreur stats dashboard:', err)
    });

    // Load total patients
    this.patientService.getAll(this.user.cabinetId).subscribe({
      next: (patients) => {
        this.totalPatients = patients.length;
      },
      error: (err) => console.error('Erreur patients:', err)
    });

    // Load consultations week stats for line chart
    this.rdvService.getConsultationsWeekStats(this.user.cabinetId).subscribe({
      next: (data) => {
        this.updateLineChart(data);
      },
      error: (err) => console.error('Erreur consultations week:', err)
    });

    // Load types repartition for donut chart
    this.rdvService.getTypesRepartition(this.user.cabinetId).subscribe({
      next: (data) => {
        this.updateDonutChart(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur types repartition:', err);
        this.isLoading = false;
      }
    });
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
    const values = data.map(d => d.count);
    const labels = data.map(d => d.jour);

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
        categories: labels
      }
    };
  }

  private updateDonutChart(data: { [key: string]: number }): void {
    const labels = Object.keys(data);
    const values = Object.values(data);

    if (labels.length === 0) {
      // Données par défaut si aucune donnée
      this.donutChartOptions = {
        ...this.donutChartOptions,
        series: [1],
        labels: ['Aucune donnée']
      };
    } else {
      this.donutChartOptions = {
        ...this.donutChartOptions,
        series: values,
        labels: labels
      };
    }
  }
}
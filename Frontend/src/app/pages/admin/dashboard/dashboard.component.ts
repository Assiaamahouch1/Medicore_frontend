import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  CabinetService, 
  Cabinet, 
  AdminDashboardStats 
} from '../../../../services/cabinet.service';
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

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardAdminComponent implements OnInit {
  @ViewChild('barChart') barChart!: ChartComponent;
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
  stats: AdminDashboardStats = {
    totalCabinets: 0,
    cabinetsActifs: 0,
    cabinetsInactifs: 0,
    cabinetsExpirantBientot: 0,
    repartitionParSpecialite: {},
    cabinetsExpires: 0
  };

  // Pour Admin de cabinet
  cabinetInfo: Cabinet | null = null;

  // Cabinets expirant bientôt (alertes)
  expiringCabinets: Cabinet[] = [];

  isLoading: boolean = true;
  isSuperAdmin: boolean = false;

  // Chart options
  barChartOptions!: BarChartOptions;
  donutChartOptions!: DonutChartOptions;

  constructor(
    private cabinetService: CabinetService,
    private authService: AuthService
  ) {
    this.initBarChart();
    this.initDonutChart();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentAuth().subscribe({
      next: (user) => {
        this.user = user;
        this.isSuperAdmin = user.role === 'SUPERADMIN';
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Erreur chargement user:', err);
        this.isLoading = false;
      }
    });
  }

  loadDashboardData(): void {
    if (this.isSuperAdmin) {
      // SuperAdmin : voir toutes les stats globales
      this.loadSuperAdminData();
    } else {
      // Admin de cabinet : voir les stats de son cabinet
      this.loadAdminCabinetData();
    }
  }

  private loadSuperAdminData(): void {
    // Charger les statistiques globales
    this.cabinetService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.updateBarChart();
        this.updateDonutChart(data.repartitionParSpecialite);
      },
      error: (err) => console.error('Erreur stats dashboard:', err)
    });

    // Charger les cabinets expirant bientôt
    this.cabinetService.getExpiringCabinets(7).subscribe({
      next: (data) => {
        this.expiringCabinets = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur cabinets expiring:', err);
        this.isLoading = false;
      }
    });
  }

  private loadAdminCabinetData(): void {
    if (!this.user.cabinetId) {
      console.warn('cabinetId non défini pour cet admin');
      this.isLoading = false;
      return;
    }

    // Charger les infos du cabinet de l'admin
    this.cabinetService.getCabinetStats(this.user.cabinetId).subscribe({
      next: (data) => {
        this.cabinetInfo = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur cabinet stats:', err);
        this.isLoading = false;
      }
    });
  }

  private initBarChart(): void {
    this.barChartOptions = {
      series: [
        {
          name: 'Cabinets',
          data: [0, 0, 0]
        }
      ],
      chart: {
        type: 'bar',
        height: 280,
        fontFamily: 'Outfit, sans-serif',
        toolbar: {
          show: false
        }
      },
      colors: ['#12b76a', '#f04438', '#f79009'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 6,
          distributed: true
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '14px',
          fontWeight: 600
        }
      },
      xaxis: {
        categories: ['Actifs', 'Inactifs', 'Expirent bientôt'],
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
      fill: {
        opacity: 1
      },
      tooltip: {
        theme: 'light'
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
      colors: ['#465fff', '#7592ff', '#36bffa', '#fb6514', '#12b76a', '#f79009', '#f04438', '#7a5af8'],
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

  private updateBarChart(): void {
    this.barChartOptions = {
      ...this.barChartOptions,
      series: [
        {
          name: 'Cabinets',
          data: [
            this.stats.cabinetsActifs,
            this.stats.cabinetsInactifs,
            this.stats.cabinetsExpirantBientot
          ]
        }
      ]
    };
  }

  private updateDonutChart(data: { [key: string]: number }): void {
    const labels = Object.keys(data);
    const values = Object.values(data);

    if (labels.length === 0) {
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

  // Calculer les jours restants avant expiration
  getDaysUntilExpiration(dateStr: string | undefined): number {
    if (!dateStr) return 0;
    const expDate = new Date(dateStr);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Renouveler un abonnement
  renewSubscription(cabinetId: number): void {
    this.cabinetService.renewSubscription(cabinetId, 1).subscribe({
      next: () => {
        // Recharger les données
        this.loadDashboardData();
      },
      error: (err) => console.error('Erreur renouvellement:', err)
    });
  }
}
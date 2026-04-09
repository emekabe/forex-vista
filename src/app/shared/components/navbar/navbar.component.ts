import { Component, inject, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { ForexDataService } from '../../../services/forex-data.service';
import { PortfolioService } from '../../../services/portfolio.service';
import { DataSourceStatus } from '../../../models/data-source.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DecimalPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected theme     = inject(ThemeService);
  protected dataFeed  = inject(ForexDataService);
  protected portfolio = inject(PortfolioService);
  readonly DataSourceStatus = DataSourceStatus;

  readonly menuClick = output<void>();
}

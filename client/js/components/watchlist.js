// Corporate EWS - Watchlist Component

const WatchlistComponent = {
  currentFilters: {
    search: '',
    sector: 'ALL',
    alertOnly: false,
    manipOnly: false,
    sort: 'RANK_ASC'
  },

  async render(container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading Corporate Risk Watchlist...</p>
      </div>
    `;

    try {
      const items = await API.getWatchlist(this.currentFilters);

      const sectors = ['ALL', 'INFRA', 'NBFC', 'AIR', 'TEX', 'STL', 'TRV', 'TEL', 'AUTO', 'ENG'];

      let html = `
        <div class="watchlist-view">
          <!-- Page Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
            <div>
              <h1 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--text-primary);">
                Corporate Risk Watchlist
              </h1>
              <p style="font-size:12px; color:var(--text-secondary);">
                Prioritized queue of 40 Indian corporate borrowers • <strong>5% Alert Budget Constrained</strong>
              </p>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge badge-cap" id="watchlist_active_alerts_count">
                ${items.filter(i => i.alert_selected).length} Active Alerts
              </span>
              <span class="badge badge-version">
                ${items.length} Showing
              </span>
            </div>
          </div>

          <!-- Filter Toolbar -->
          <div class="filter-toolbar">
            <div class="search-input-wrap">
              <i class="fa-solid fa-search"></i>
              <input type="text" id="watchlist_search_input" class="search-input" 
                placeholder="Search by legal name, trade name, or CIN..." 
                value="${this.currentFilters.search}">
            </div>

            <div class="sector-pills" id="sector_pills_container">
              ${sectors.map(s => `
                <button class="sector-pill ${this.currentFilters.sector === s ? 'active' : ''}" data-sector="${s}">
                  ${s}
                </button>
              `).join('')}
            </div>

            <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
              <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer; color:var(--text-secondary);">
                <input type="checkbox" id="filter_alert_only" ${this.currentFilters.alertOnly ? 'checked' : ''}>
                <span>5% Active Alerts Only</span>
              </label>

              <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer; color:var(--text-secondary);">
                <input type="checkbox" id="filter_manip_only" ${this.currentFilters.manipOnly ? 'checked' : ''}>
                <span>Manipulators Only</span>
              </label>

              <select id="watchlist_sort_select" class="form-select" style="width:160px; padding:6px 10px; font-size:12px;">
                <option value="RANK_ASC" ${this.currentFilters.sort === 'RANK_ASC' ? 'selected' : ''}>Priority Rank (Top 1st)</option>
                <option value="RISK_DESC" ${this.currentFilters.sort === 'RISK_DESC' ? 'selected' : ''}>Risk Score (High-Low)</option>
                <option value="MANIP_DESC" ${this.currentFilters.sort === 'MANIP_DESC' ? 'selected' : ''}>Manipulation Risk</option>
                <option value="NAME_ASC" ${this.currentFilters.sort === 'NAME_ASC' ? 'selected' : ''}>Company Name</option>
              </select>
            </div>
          </div>

          <!-- Watchlist Table -->
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:70px;">Rank</th>
                  <th>Borrower / Legal Entity</th>
                  <th>Sector</th>
                  <th>Rating</th>
                  <th>Altman Z''</th>
                  <th>Beneish M-Score</th>
                  <th>Piotroski F</th>
                  <th>Priority Score</th>
                  <th>Alert Status</th>
                  <th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${items.length === 0 ? `
                  <tr>
                    <td colspan="10" style="text-align:center; padding:40px; color:var(--text-muted);">
                      <i class="fa-solid fa-filter" style="font-size:24px; margin-bottom:8px; display:block;"></i>
                      No borrowers match the selected filters.
                    </td>
                  </tr>
                ` : items.map(item => `
                  <tr class="${item.alert_selected ? 'row-alert' : ''}" style="cursor:pointer;" onclick="App.selectBorrower('${item.company_id}')">
                    <td>
                      <strong style="font-family:var(--font-mono); font-size:13px; color:${item.alert_selected ? 'var(--color-ruby)' : 'var(--text-secondary)'};">
                        #${item.priority_rank}
                      </strong>
                    </td>
                    <td>
                      <div style="font-weight:700; color:var(--text-primary); font-size:14px;">
                        ${item.trade_name}
                        ${item.is_defaulted ? '<span class="badge badge-cap" style="margin-left:6px; font-size:9px;">HISTORICAL DEFAULTER</span>' : ''}
                      </div>
                      <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
                        CIN: ${item.cin}
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-version">${item.sector_code}</span>
                      <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${item.industry_name}</div>
                    </td>
                    <td>
                      <span style="font-family:var(--font-mono); font-size:11px; font-weight:600; color:${item.credit_rating.includes('D') ? 'var(--color-ruby)' : 'var(--text-secondary)'};">
                        ${item.credit_rating}
                      </span>
                    </td>
                    <td>
                      ${Formatters.getAltmanBadge(item.altman_status, item.altman_z_score)}
                    </td>
                    <td>
                      ${Formatters.getBeneishBadge(item.beneish_status, item.beneish_m_score)}
                    </td>
                    <td>
                      ${Formatters.getPiotroskiBadge(item.piotroski_status, item.piotroski_f_score)}
                    </td>
                    <td>
                      <span class="mono-cell" style="font-size:14px; font-weight:800; color:${item.priority_score >= 80 ? 'var(--color-ruby)' : item.priority_score >= 50 ? 'var(--color-amber)' : 'var(--color-primary)'};">
                        ${item.priority_score.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      ${item.alert_selected ? `
                        <span class="badge badge-cap" title="Selected within 5% Alert Budget Ceiling">
                          <i class="fa-solid fa-triangle-exclamation" style="margin-right:4px;"></i> 5% ACTIVE ALERT
                        </span>
                      ` : `
                        <span class="badge badge-subtle">MONITOR QUEUE</span>
                      `}
                    </td>
                    <td style="text-align:right;">
                      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); App.selectBorrower('${item.company_id}')">
                        <i class="fa-solid fa-magnifying-glass-chart"></i> Investigate
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Attach Event Listeners
      this.attachEventListeners(container);
    } catch (err) {
      container.innerHTML = `<div class="card" style="padding:24px; text-align:center;"><p style="color:var(--color-ruby);">${err.message}</p></div>`;
    }
  },

  attachEventListeners(container) {
    const searchInput = document.getElementById('watchlist_search_input');
    if (searchInput) {
      let timeout = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.currentFilters.search = e.target.value.trim();
          this.render(container);
        }, 300);
      });
    }

    const sectorPills = container.querySelectorAll('.sector-pill');
    sectorPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        this.currentFilters.sector = e.target.getAttribute('data-sector');
        this.render(container);
      });
    });

    const alertOnlyCheckbox = document.getElementById('filter_alert_only');
    if (alertOnlyCheckbox) {
      alertOnlyCheckbox.addEventListener('change', (e) => {
        this.currentFilters.alertOnly = e.target.checked;
        this.render(container);
      });
    }

    const manipOnlyCheckbox = document.getElementById('filter_manip_only');
    if (manipOnlyCheckbox) {
      manipOnlyCheckbox.addEventListener('change', (e) => {
        this.currentFilters.manipOnly = e.target.checked;
        this.render(container);
      });
    }

    const sortSelect = document.getElementById('watchlist_sort_select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentFilters.sort = e.target.value;
        this.render(container);
      });
    }
  }
};

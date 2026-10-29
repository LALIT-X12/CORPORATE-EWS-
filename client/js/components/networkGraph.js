// Corporate EWS - Relational Fraud Network Graph Component
// Addresses GAP 1: Inability to Capture Relational Fraud Structures

const NetworkGraphComponent = {
  async render(container, companyId) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Traversing corporate entity graph and circular transaction structures...</p>
      </div>
    `;

    try {
      const data = await API.getNetwork(companyId);

      const m = data.metrics;

      let html = `
        <div class="network-graph-view">
          <!-- Top KPI Metrics Banner -->
          <div class="grid-4" style="margin-bottom:16px;">
            <div class="card metric-card" style="padding:14px;">
              <span class="metric-label">Network Contagion Score</span>
              <div class="metric-value-row">
                <span class="metric-value ${data.contagionScore >= 75 ? 'ruby' : data.contagionScore >= 50 ? 'amber' : 'teal'}">
                  ${data.contagionScore}/100
                </span>
                <span class="badge ${data.contagionScore >= 75 ? 'badge-cap' : 'badge-version'}">${m.relationalRiskLevel}</span>
              </div>
              <span class="card-subtitle">Contagion Propagation Risk</span>
            </div>

            <div class="card metric-card" style="padding:14px;">
              <span class="metric-label">Interconnected Entities</span>
              <div class="metric-value-row">
                <span class="metric-value cyan">${m.totalEntities}</span>
                <span class="metric-delta">Nodes</span>
              </div>
              <span class="card-subtitle">Borrowers, Promoters, SPVs, Shells</span>
            </div>

            <div class="card metric-card" style="padding:14px;">
              <span class="metric-label">Distressed Links</span>
              <div class="metric-value-row">
                <span class="metric-value ruby">${m.distressedLinks}</span>
                <span class="metric-delta">Contagion Edges</span>
              </div>
              <span class="card-subtitle">Defaulted SPVs & Guarantors</span>
            </div>

            <div class="card metric-card" style="padding:14px;">
              <span class="metric-label">Circular Fund Flows</span>
              <div class="metric-value-row">
                <span class="metric-value amber">${m.circularFlowsDetected}</span>
                <span class="metric-delta">Round-Tripping</span>
              </div>
              <span class="card-subtitle">Closed fund diversion loops</span>
            </div>
          </div>

          <!-- Network Canvas Wrapper -->
          <div class="network-canvas-wrap" id="network_canvas_container">
            <!-- Legend overlay -->
            <div class="graph-legend">
              <span style="font-weight:700; color:var(--text-primary); margin-bottom:2px;">Entity Graph Legend</span>
              <div class="legend-item"><span class="legend-dot borrower"></span> Monitored Corporate Borrower</div>
              <div class="legend-item"><span class="legend-dot promoter"></span> Controlling Promoter / Director</div>
              <div class="legend-item"><span class="legend-dot shell"></span> Shell Hub / SPV Counterparty</div>
              <div class="legend-item"><span class="legend-dot distressed"></span> Distressed / Defaulted Node</div>
              <div class="legend-item">
                <span style="width:12px; height:2px; background:var(--color-ruby); border-top:1px dashed var(--color-ruby);"></span>
                Circular Siphoning Path
              </div>
            </div>

            <!-- Controls overlay -->
            <div class="graph-controls">
              <button class="graph-control-btn" id="graph_zoom_in" title="Zoom In"><i class="fa-solid fa-plus"></i></button>
              <button class="graph-control-btn" id="graph_zoom_out" title="Zoom Out"><i class="fa-solid fa-minus"></i></button>
              <button class="graph-control-btn" id="graph_reset" title="Reset View"><i class="fa-solid fa-arrows-rotate"></i></button>
            </div>

            <!-- SVG Graph Container -->
            <svg id="network_svg_element" class="network-svg" viewBox="0 0 900 520"></svg>
          </div>

          <!-- Node Inspection Details Box -->
          <div class="card" id="network_node_details" style="margin-top:16px;">
            <div class="card-header">
              <h4 class="card-title">
                <i class="fa-solid fa-circle-nodes" style="color:var(--color-primary);"></i>
                <span id="selected_node_title">Entity Relationship Intelligence & Siphoning Paths</span>
              </h4>
              <span class="badge badge-version" id="selected_node_type_badge">RELATIONAL FRAUD ENGINE</span>
            </div>
            <div id="selected_node_body">
              <p style="font-size:13px; color:var(--text-secondary); line-height:1.6;">
                Click any node on the graph above to inspect its forensic links, guarantee exposures, circular transactions, and regulatory charge-sheets.
              </p>
              ${data.links.map(l => `
                <div style="padding:10px 14px; background:var(--bg-surface-elevated); border-radius:var(--radius-sm); border-left:3px solid ${l.isDistressed ? 'var(--color-ruby)' : 'var(--color-primary)'}; margin-top:8px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <strong style="color:var(--text-primary); font-size:13px;">${l.type.replace(/_/g, ' ')}</strong>
                    <span class="badge ${l.isDistressed ? 'badge-cap' : 'badge-subtle'}">${l.isDistressed ? 'DISTRESSED CONTAGION' : 'VERIFIED LINK'}</span>
                  </div>
                  <div style="font-size:12px; color:var(--text-secondary); font-family:var(--font-mono); margin-bottom:4px;">
                    ${l.pathDescription}
                  </div>
                  ${l.details ? `<div style="font-size:12px; color:var(--color-ruby);">${l.details}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Render Interactive Nodes & Edges on SVG
      this.drawSvgGraph(data);
    } catch (err) {
      container.innerHTML = `<div class="card" style="padding:24px; text-align:center;"><p style="color:var(--color-ruby);">${err.message}</p></div>`;
    }
  },

  drawSvgGraph(data) {
    const svg = document.getElementById('network_svg_element');
    if (!svg) return;

    const width = 900;
    const height = 520;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodes = data.nodes;
    const links = data.links;

    // Position root node in center
    const rootNode = nodes[0];
    rootNode.x = centerX;
    rootNode.y = centerY;

    // Distribute remaining nodes in concentric circles
    const remainingNodes = nodes.slice(1);
    const radius = 180;
    const angleStep = (2 * Math.PI) / Math.max(1, remainingNodes.length);

    remainingNodes.forEach((node, i) => {
      const angle = i * angleStep;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    let svgContent = `
      <defs>
        <marker id="arrow" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,-5L10,0L0,5" fill="var(--color-primary)" opacity="0.8" />
        </marker>
        <marker id="arrow-distressed" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,-5L10,0L0,5" fill="var(--color-ruby)" opacity="0.9" />
        </marker>
      </defs>
      <g id="graph_viewport">
        <!-- Links -->
        <g class="links-group">
          ${links.map(l => {
            const sourceNode = nodes.find(n => n.id === l.source) || rootNode;
            const targetNode = nodes.find(n => n.id === l.target) || remainingNodes[0] || rootNode;
            const isDistressed = l.isDistressed;
            const isCircular = l.type === 'ROUND_TRIPPING_FLOW';
            const marker = isDistressed ? 'url(#arrow-distressed)' : 'url(#arrow)';

            return `
              <line class="network-link ${isDistressed ? 'distressed-link' : ''} ${isCircular ? 'circular-flow' : ''}"
                    x1="${sourceNode.x}" y1="${sourceNode.y}"
                    x2="${targetNode.x}" y2="${targetNode.y}"
                    marker-end="${marker}"
                    title="${l.pathDescription}" />
            `;
          }).join('')}
        </g>

        <!-- Nodes -->
        <g class="nodes-group">
          ${nodes.map((n, idx) => {
            const isPrimary = idx === 0;
            const isDistressed = n.isDistressed;
            const isShell = n.type === 'SHELL_COUNTERPARTY' || n.type === 'SUBSIDIARY_SPV';
            const nodeRadius = isPrimary ? 24 : (isShell ? 18 : 16);
            const fillCol = isPrimary ? 'var(--color-primary)' : isDistressed ? 'var(--color-ruby)' : isShell ? 'var(--color-amber)' : '#a855f7';

            return `
              <g class="network-node ${isPrimary ? 'primary' : ''} ${isDistressed ? 'distressed' : ''} ${isShell ? 'shell' : ''}"
                 transform="translate(${n.x}, ${n.y})"
                 data-node-id="${n.id}"
                 onclick="NetworkGraphComponent.onNodeClick('${n.id}', '${encodeURIComponent(JSON.stringify(n))}')">
                
                ${isPrimary || isDistressed ? `
                  <circle r="${nodeRadius + 8}" fill="${fillCol}" opacity="0.2" class="pulse-ring" />
                ` : ''}

                <circle r="${nodeRadius}" fill="${fillCol}" stroke="var(--bg-surface)" stroke-width="2.5" />
                
                <text y="${nodeRadius + 14}" text-anchor="middle" fill="var(--text-primary)" font-size="11" font-weight="600" font-family="var(--font-sans)">
                  ${n.label.length > 22 ? n.label.substring(0, 20) + '...' : n.label}
                </text>
                <text y="${nodeRadius + 26}" text-anchor="middle" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)">
                  ${n.type.replace(/_/g, ' ')}
                </text>
              </g>
            `;
          }).join('')}
        </g>
      </g>
    `;

    svg.innerHTML = svgContent;
  },

  onNodeClick(nodeId, nodeDataEncoded) {
    try {
      const node = JSON.parse(decodeURIComponent(nodeDataEncoded));
      const titleEl = document.getElementById('selected_node_title');
      const badgeEl = document.getElementById('selected_node_type_badge');
      if (titleEl) titleEl.innerText = `${node.label} (${node.type.replace(/_/g, ' ')})`;
      if (badgeEl) {
        badgeEl.className = `badge ${node.isDistressed ? 'badge-cap' : 'badge-version'}`;
        badgeEl.innerText = node.isDistressed ? 'DISTRESSED CONTAGION NODE' : 'VERIFIED NETWORK NODE';
      }
    } catch (e) {
      console.error('Node click parse error', e);
    }
  }
};

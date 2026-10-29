// Injected inside the preview closure by build-preview.cjs. Preferences are
// customer requests, never promises about the vendor's actual inclusions.
function serviceProfile(service) {
  const name = service.name.toLowerCase();
  const occasion = occasionKey(state.occasion || '');
  const birthday = occasion === 'birthday';
  const ceremony = ['wedding', 'engagement'].includes(occasion);
  const quantityLabels = {per_plate:'Plates',per_hour:'Hours',per_day:'Days',per_event:'Events',fixed:'Quantity',performance:'Performances'};
  const base = {quantityLabel:quantityLabels[service.pricingType] || 'Quantity', icon:'sparkles'};
  if (service.pricingType === 'per_plate' || /cater|buffet|dessert|meal/.test(name)) {
    return {...base,icon:'utensils',hint:'Plate count sets this estimate. Agree the final menu with the vendor.',fields:[
      {key:'menu',label:'Menu preference',options:['Vegetarian','Non-vegetarian','Mixed menu','Discuss with vendor']},
      {key:'meal',label:'Meal service',options:['Breakfast','Lunch','Dinner','Snacks / high tea']},
      {key:'requests',label:'Dietary and serving requests',placeholder:birthday?'Kids’ portions, allergies, cake service…':'Allergies, live counters, serving times…',multiline:true},
    ]};
  }
  if (/decor|backdrop|floral/.test(name) || getVendor().vendorType === 'Decoration') {
    return {...base,icon:'flower-2',hint:'Describe the look you want. Materials and setup are confirmed by the vendor.',fields:[
      {key:'theme',label:'Theme or colour palette',placeholder:birthday?'e.g. Space theme, red and silver':ceremony?'e.g. Ivory florals with warm lighting':'e.g. Brand colours or a floral theme'},
      {key:'area',label:'Setup area',options:['Indoor','Outdoor','Both','To be decided']},
      {key:'requests',label:'Decoration requirements',placeholder:birthday?'Backdrop, cake table, name signage…':ceremony?'Ceremony stage, entrance, seating decor…':'Backdrop dimensions, tables, signage…',multiline:true},
    ]};
  }
  if (/light|sound|dj|pa system/.test(name)) {
    return {...base,icon:'headphones',hint:'Share the setup and timing. Equipment and power requirements need confirmation.',fields:[
      {key:'setup',label:'Event setup',options:['Indoor','Outdoor','Both','To be decided']},
      {key:'start',label:'Preferred start time',type:'time'},
      {key:'requests',label:'Sound or lighting requirements',placeholder:birthday?'Cake-cutting lights, party music…':ceremony?'Ceremony audio, reception lighting…':'Stage size, microphones, performance schedule…',multiline:true},
    ]};
  }
  if (/album/.test(name)) {
    return {...base,icon:'images',hint:'Share the album format and layout you want. Print specifications and delivery need confirmation.',fields:[
      {key:'format',label:'Album format preference',options:['Hardcover','Lay-flat','Discuss with vendor']},
      {key:'requests',label:'Album requirements',placeholder:'Preferred size, photo selection, layout or delivery date…',multiline:true},
    ]};
  }
  if (/photo|video|film/.test(name)) {
    return {...base,icon:'camera',hint:'Choose coverage and share the moments you want captured. Deliverables need vendor confirmation.',fields:[
      {key:'coverage',label:'Coverage preference',options:['Main ceremony / activity','Entire event','Discuss with vendor']},
      {key:'requests',label:'Moments and deliverables',placeholder:birthday?'Cake cutting, family portraits, candid shots…':ceremony?'Ceremony, couple portraits, family photos…':'Key speakers, team photos, highlight moments…',multiline:true},
    ]};
  }
  if (getVendor().vendorType === 'Venue') {
    return {...base,icon:'landmark',hint:'Share the space and seating you need. Capacity, timings and amenities need vendor confirmation.',fields:[
      {key:'layout',label:'Seating preference',options:['Banquet / round tables','Theatre seating','Standing / reception','Discuss with vendor']},
      {key:'start',label:'Preferred start time',type:'time'},
      {key:'requests',label:'Venue requirements',placeholder:birthday?'Kids’ activity area, cake table, accessibility…':ceremony?'Ceremony space, dining area, getting-ready room…':'Stage, seating, accessibility or equipment…',multiline:true},
    ]};
  }
  if (/makeup|mehendi|groom/.test(name)) {
    return {...base,icon:'brush',hint:'Share the look and ready-by time. Products, artists and final scope need confirmation.',fields:[
      {key:'look',label:'Preferred look or style',placeholder:ceremony?'e.g. Traditional bridal look, floral mehendi':'e.g. Natural party look or minimal mehendi'},
      {key:'start',label:'Ready-by time',type:'time'},
      {key:'requests',label:'Styling requirements',placeholder:'People to style, sensitivities, venue and special requests…',multiline:true},
    ]};
  }
  if (service.artist || getVendor().vendorType === 'Orchestra & Melody') {
    return {...base,icon:'mic-2',hint:'Share the performance you want. Lineup, duration and technical needs must be agreed with the vendor.',fields:[
      {key:'start',label:'Preferred performance time',type:'time'},
      {key:'requests',label:'Performance preferences',placeholder:birthday?'Birthday dedication, favourite songs, language…':'Style, language, songs or special requests…',multiline:true},
    ]};
  }
  return {...base,icon:service.artist?'mic-2':'sparkles',hint:'Share what you need for this occasion. The vendor will confirm the scope.',fields:[
    {key:'start',label:service.artist?'Preferred performance time':'Preferred start time',type:'time'},
    {key:'requests',label:service.artist?'Performance preferences':'Your requirements',placeholder:service.artist?'Style, language, songs or special requests…':`What do you need for ${state.occasion || 'your event'}?`,multiline:true},
  ]};
}

function serviceContext() {
  return state.occasion ? `${state.occasion}${state.linked ? ` · ${state.guests} guests` : ''}` : 'Your service request';
}

function preferenceSummary(id) {
  const service = menu()[id];
  const values = state.servicePreferences[id] || {};
  return serviceProfile(service).fields.filter(field=>values[field.key]?.trim()).map(field=>`${field.label}: ${values[field.key].trim()}`);
}

function openService(id) {
  if (!menu()[id]) return;
  state.serviceIndex = id;
  state.serviceReturn = state.screen;
  state.serviceScroll = root.querySelector('.ep-body')?.scrollTop || 0;
  state.draftQuantity = state.selected[id] || (menu()[id].pricingType === 'per_plate' && state.linked ? state.guests : 1);
  state.draftPreferences = {...(state.servicePreferences[id] || {})};
  go('service');
}

function returnFromService() {
  if (state.history[state.history.length - 1] === state.serviceReturn) state.history.pop();
  state.screen = state.serviceReturn || 'build';
  state.sheet = null;
  render(true);
  const body = root.querySelector('.ep-body');
  if (body) body.scrollTop = state.serviceScroll || 0;
}

function preferenceField(field) {
  const value = state.draftPreferences[field.key] || '';
  const attributes = `data-pref="${field.key}" name="preference-${field.key}"`;
  const control = field.options
    ? `<select class="ep-input" ${attributes}><option value="">Choose (optional)</option>${field.options.map(option=>`<option ${value===option?'selected':''}>${esc(option)}</option>`).join('')}</select>`
    : field.multiline
      ? `<textarea class="ep-input" ${attributes} maxlength="500" placeholder="${esc(field.placeholder)}">${esc(value)}</textarea>`
      : `<input class="ep-input" ${attributes} type="${field.type || 'text'}" maxlength="120" placeholder="${esc(field.placeholder || '')}" value="${esc(value)}">`;
  return `<label class="ep-field"><span class="ep-label">${esc(field.label)}</span>${control}</label>`;
}

function serviceDetails() {
  const id = state.serviceIndex;
  const service = menu()[id];
  const profile = serviceProfile(service);
  const selected = !!state.selected[id];
  return `${header('Service details')}<main class="ep-body">
    <div class="ep-service-provider">${icon(profile.icon)}<span>${esc(getVendor().businessName)}</span>${selected?'<span class="ep-tag">Selected</span>':''}</div>
    <h1>${esc(service.name)}</h1>
    <p class="ep-subtitle">${esc(service.description || 'Detailed inclusions have not been provided by this vendor.')}</p>
    <div class="ep-context">${icon('calendar-days')}<div><strong>${esc(serviceContext())}</strong><span>${esc(profile.hint)}</span></div></div>
    <div class="ep-service-line"><span>Service rate</span><span><strong>${money(service.price)}</strong><span class="ep-caption">${unit(service.pricingType)}</span></span></div>
    <div class="ep-qty"><label for="ep-detail-quantity">${profile.quantityLabel}</label><div class="ep-stepper">
      ${action('detail-minus',icon('minus'),'','aria-label="Decrease service quantity"')}
      <input id="ep-detail-quantity" name="serviceQuantity" type="number" min="1" max="10000" step="1" required value="${state.draftQuantity}">
      ${action('detail-plus',icon('plus'),'','aria-label="Increase service quantity"')}
    </div></div>
    <div class="ep-section"><h2>Your preferences</h2><span class="ep-caption">Optional</span></div>
    ${profile.fields.map(preferenceField).join('')}
    <div class="ep-note">${icon('info')}<span>These are your requested preferences. The vendor needs to confirm inclusions, availability and any price changes.</span></div>
    ${state.mode==='single'&&!selected&&selectedItems().length?'<p class="ep-muted">One-service mode: adding this replaces your current selection.</p>':''}
    ${selected?action('remove-service','Remove from selection','ep-link'):''}
  </main><footer class="ep-dock"><div class="ep-dock-summary"><span class="ep-muted">This service estimate</span><strong class="ep-total" data-service-total>${money(service.price * state.draftQuantity)}</strong></div>
    ${action('save-service',`${selected?'Save service details':'Add service'} ${icon('check')}`)}
  </footer>`;
}

function updateDraftQuantity(value) {
  state.draftQuantity = Math.max(1, Math.min(10000, Math.round(Number(value) || 1)));
  const input = root.querySelector('#ep-detail-quantity');
  if (input) input.value = state.draftQuantity;
  const amount = root.querySelector('[data-service-total]');
  if (amount) amount.textContent = money(menu()[state.serviceIndex].price * state.draftQuantity);
}

function saveServiceDetails() {
  const quantity = root.querySelector('#ep-detail-quantity');
  if (!quantity.reportValidity()) return;
  if (state.mode === 'single') state.selected = {};
  state.selected[state.serviceIndex] = Number(quantity.value);
  state.servicePreferences[state.serviceIndex] = {...state.draftPreferences};
  returnFromService();
}

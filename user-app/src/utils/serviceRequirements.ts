import type { Artist, RequirementKey, Service, ServiceRequirements } from '../types';

export type RequirementField = { key: RequirementKey; label: string; options?: string[]; placeholder?: string; multiline?: boolean; time?: boolean };
export type ServiceOption = { id: string; name: string; description?: string; price: number; pricingType: string; artist: boolean; available: boolean };
export const serviceToOption = (service: Service): ServiceOption => ({ id: service._id, name: service.name, description: service.description, price: service.price, pricingType: service.pricingType, artist: false, available: true });
export const artistToOption = (artist: Artist): ServiceOption => ({ id: artist._id, name: artist.name, description: artist.bio || artist.roleOrSkill, price: artist.pricePerPerformance, pricingType: 'performance', artist: true, available: artist.isAvailable });

export const requirementLabels: Record<RequirementKey, string> = {
  menu: 'Menu preference', meal: 'Meal service', requests: 'Special requirements', theme: 'Theme / colours',
  area: 'Setup area', setup: 'Event setup', start: 'Requested time', coverage: 'Coverage', format: 'Album format', look: 'Look / style', layout: 'Seating preference',
};
export function requirementEntries(requirements: ServiceRequirements = {}) {
  return (Object.keys(requirementLabels) as RequirementKey[]).filter(key => requirements[key]?.trim())
    .map(key => ({ key, label: requirementLabels[key], value: requirements[key]!.trim() }));
}
export function cleanRequirements(requirements: ServiceRequirements): ServiceRequirements {
  return Object.fromEntries(requirementEntries(requirements).map(item => [item.key, item.value]));
}
export const fixedQuantity = (type: string) => ['fixed', 'per_event', 'performance'].includes(type);
export const pricingUnit = (type: string) => ({ fixed: 'fixed', per_event: '/ event', per_plate: '/ plate', per_hour: '/ hour', per_day: '/ day', performance: '/ performance' })[type] || type;
export const quantityLabel = (type: string) => ({ per_plate: 'Plates', per_hour: 'Hours', per_day: 'Days' })[type] || 'Quantity';

export function getServiceProfile(service: ServiceOption, vendorType: string, occasion: string): { hint: string; fields: RequirementField[] } {
  const name = service.name.toLowerCase();
  const birthday = /birthday|birth day/.test(occasion.toLowerCase());
  const ceremony = /wedding|marriage|shaadi|engagement|ring ceremony|roka/.test(occasion.toLowerCase());
  if (service.pricingType === 'per_plate' || /cater|buffet|dessert|meal/.test(name)) return {
    hint: 'Plate count sets the estimate. Agree the final menu with the vendor.', fields: [
      { key: 'menu', label: 'Menu preference', options: ['Vegetarian', 'Non-vegetarian', 'Mixed menu', 'Discuss with vendor'] },
      { key: 'meal', label: 'Meal service', options: ['Breakfast', 'Lunch', 'Dinner', 'Snacks / high tea'] },
      { key: 'requests', label: 'Dietary and serving requests', multiline: true, placeholder: birthday ? 'Kids’ portions, allergies, cake service…' : 'Allergies, serving times, live counters…' },
    ],
  };
  if (/decor|backdrop|floral/.test(name) || vendorType === 'Decoration') return {
    hint: 'Describe the look you want. Confirm materials and setup with the vendor.', fields: [
      { key: 'theme', label: 'Theme or colour palette', placeholder: birthday ? 'e.g. Space theme, red and silver' : ceremony ? 'e.g. Ivory florals with warm lighting' : 'e.g. Brand colours or a floral theme' },
      { key: 'area', label: 'Setup area', options: ['Indoor', 'Outdoor', 'Both', 'To be decided'] },
      { key: 'requests', label: 'Decoration requirements', multiline: true, placeholder: birthday ? 'Backdrop, cake table, name signage…' : 'Stage, entrance, seating, dimensions…' },
    ],
  };
  if (/light|sound|dj|pa system/.test(name)) return {
    hint: 'Share the setup and timing. Equipment and power needs require confirmation.', fields: [
      { key: 'setup', label: 'Event setup', options: ['Indoor', 'Outdoor', 'Both', 'To be decided'] },
      { key: 'start', label: 'Preferred start time', time: true, placeholder: 'HH:mm, e.g. 18:00' },
      { key: 'requests', label: 'Sound or lighting requirements', multiline: true, placeholder: birthday ? 'Cake-cutting lights, party music…' : 'Stage size, microphones, performance schedule…' },
    ],
  };
  if (/album/.test(name)) return { hint: 'Confirm print specifications and delivery with the vendor.', fields: [
    { key: 'format', label: 'Album format preference', options: ['Hardcover', 'Lay-flat', 'Discuss with vendor'] },
    { key: 'requests', label: 'Album requirements', multiline: true, placeholder: 'Size, photo selection, layout or delivery date…' },
  ] };
  if (/photo|video|film/.test(name)) return { hint: 'Describe your coverage. Confirm the final deliverables with the vendor.', fields: [
    { key: 'coverage', label: 'Coverage preference', options: ['Main ceremony / activity', 'Entire event', 'Discuss with vendor'] },
    { key: 'requests', label: 'Moments and deliverables', multiline: true, placeholder: birthday ? 'Cake cutting, family portraits, candid shots…' : ceremony ? 'Ceremony, couple portraits, family photos…' : 'Key speakers, team photos, highlight moments…' },
  ] };
  if (vendorType === 'Venue') return { hint: 'Confirm capacity, timings and amenities with the vendor.', fields: [
    { key: 'layout', label: 'Seating preference', options: ['Banquet / round tables', 'Theatre seating', 'Standing / reception', 'Discuss with vendor'] },
    { key: 'start', label: 'Preferred start time', time: true, placeholder: 'HH:mm, e.g. 18:00' },
    { key: 'requests', label: 'Venue requirements', multiline: true, placeholder: 'Guest space, dining area, accessibility or equipment…' },
  ] };
  if (/makeup|mehendi|groom/.test(name)) return { hint: 'Confirm the look, products and ready-by time with the vendor.', fields: [
    { key: 'look', label: 'Preferred look or style', placeholder: ceremony ? 'Traditional bridal look or floral mehendi…' : 'Natural party look or minimal mehendi…' },
    { key: 'start', label: 'Ready-by time', time: true, placeholder: 'HH:mm, e.g. 16:00' },
    { key: 'requests', label: 'Styling requirements', multiline: true, placeholder: 'People to style, sensitivities or special requests…' },
  ] };
  const performer = service.artist || vendorType === 'Orchestra & Melody';
  return { hint: 'These are your requested preferences. The vendor confirms the final scope.', fields: [
    { key: 'start', label: performer ? 'Preferred performance time' : 'Preferred start time', time: true, placeholder: 'HH:mm, e.g. 18:00' },
    { key: 'requests', label: performer ? 'Performance preferences' : 'Your requirements', multiline: true, placeholder: performer ? 'Style, language, songs or special requests…' : `What do you need for ${occasion || 'your event'}?` },
  ] };
}

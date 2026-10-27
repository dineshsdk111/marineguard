export const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const formatDateTime = (date) => new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
export const formatNumber = (num) => num?.toLocaleString('en-IN') || '0';
export const formatWeight = (kg) => kg ? `${kg.toLocaleString('en-IN')} kg` : '0 kg';

export const statusColors = {
  docked: 'bg-gray-100 text-gray-700',
  at_sea: 'bg-blue-100 text-blue-700',
  fishing: 'bg-green-100 text-green-700',
  returning: 'bg-yellow-100 text-yellow-700',
  maintenance: 'bg-red-100 text-red-700',
};

export const severityColors = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const complianceStatusColors = {
  compliant: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  violation: 'bg-red-100 text-red-700',
};

export const zoneColors = {
  permitted: '#22C55E',
  restricted: '#F59E0B',
  protected: '#EF4444',
};

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const StatusBadge = ({ status }) => {
  const { t } = useLanguage();
  if (!status) return null;

  const st = status.toUpperCase();
  let badgeClass = 'badge-default';

  if (['AVAILABLE', 'APPROVED', 'SUCCESS', 'ACTIVE', 'VERIFIED'].includes(st)) {
    badgeClass = 'badge-success';
  } else if (['PENDING', 'PARTIALLY_OCCUPIED', 'RESERVED'].includes(st)) {
    badgeClass = 'badge-warning';
  } else if (['REJECTED', 'FULL', 'FAILED', 'CANCELLED'].includes(st)) {
    badgeClass = 'badge-danger';
  } else if (['MAINTENANCE'].includes(st)) {
    badgeClass = 'badge-info';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
      {t(st) || status}
    </span>
  );
};

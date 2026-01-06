
import React from 'react';
import { LayoutDashboard, FilePlus, ClipboardList, Search, Settings, HelpCircle, FileText } from 'lucide-react';

export const COMPANY_NAME = "Samuda Construction Ltd (Unit-1)";
export const ZONE_INFO = "Zone - 16, National Special Economic Zone, Mirsarai, Chattogram.";

export const SIDEBAR_MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { id: 'new', label: 'New Requisition', icon: <FilePlus size={20} />, path: '/new' },
  { id: 'history', label: 'Order History', icon: <ClipboardList size={20} />, path: '/history' },
  { id: 'reports', label: 'Reports', icon: <FileText size={20} />, path: '/reports' },
];

export const UNITS = ['Pcs', 'Kg', 'Mtr', 'Sft', 'Cft', 'Bag', 'Drum', 'Liter', 'Set', 'Bundle'];

export const DEPARTMENTS = [
  'Feed Hopper',
  'Heading & Cutting',
  'Mould Maintenance',
  'Pile Shoe Making',
  'Project',
  'QC Lab',
  'Spinning Machine',
  'Steam Pool',
  'Tensioning Machine',
  'Utility',
  'Wire Drawing Machine',
  'Workshop',
  'Apron Machine',
  'Batching Plant',
  'Boiler',
  'Cage Making',
  'Cage Settings & Fittings',
  'Crane',
  'Cushion Making',
  'Delivery',
  'Demoulding Machine',
  'Admin'
];

export const GRID_COLUMNS = [
  { key: 'item_name', label: 'Name of Item', width: '250px' },
  { key: 'specification', label: 'Specification', width: '250px' },
  { key: 'quantity', label: 'Required Quantity', width: '120px' },
  { key: 'unit', label: 'Unit', width: '100px' },
  { key: 'purpose', label: 'Purpose', width: '200px' },
  { key: 'lead_time', label: 'Lead Time (Day/s)', width: '120px' },
  { key: 'item_code', label: 'Item Code', width: '120px' },
  { key: 'remarks', label: 'Remarks', width: '200px' },
];

import type { ThemeConfig } from 'antd';

// TSP Metal Works - Ant Design Theme Configuration
// Industrial, professional aesthetic for manufacturing ERP

export const antdTheme: ThemeConfig = {
  token: {
    // Primary Colors - Deep Slate Blue
    colorPrimary: '#1e3a5f',
    colorPrimaryHover: '#2d4a73',
    colorPrimaryActive: '#152c4a',
    colorPrimaryBg: '#e8eef5',
    colorPrimaryBgHover: '#d1dce8',
    colorPrimaryBorder: '#93a8c1',
    colorPrimaryBorderHover: '#7a95b3',
    colorPrimaryText: '#1e3a5f',
    colorPrimaryTextHover: '#2d4a73',
    colorPrimaryTextActive: '#152c4a',

    // Success - Manufacturing green
    colorSuccess: '#16a34a',
    colorSuccessBg: '#dcfce7',
    colorSuccessBorder: '#86efac',

    // Warning - Amber
    colorWarning: '#f59e0b',
    colorWarningBg: '#fef3c7',
    colorWarningBorder: '#fcd34d',

    // Error - Red
    colorError: '#ef4444',
    colorErrorBg: '#fee2e2',
    colorErrorBorder: '#fca5a5',

    // Info - Blue
    colorInfo: '#0ea5e9',
    colorInfoBg: '#e0f2fe',
    colorInfoBorder: '#7dd3fc',

    // Background & Text
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorBgSpotlight: '#f1f5f9',
    colorBgMask: 'rgba(0, 0, 0, 0.45)',

    colorText: '#1e293b',
    colorTextSecondary: '#64748b',
    colorTextTertiary: '#94a3b8',
    colorTextQuaternary: '#cbd5e1',

    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',

    // Typography
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,

    // Border Radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingMD: 16,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,

    margin: 16,
    marginLG: 24,
    marginMD: 16,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // Box Shadow
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

    // Control
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,

    // Line heights
    lineHeight: 1.5714285714285714,
    lineHeightHeading1: 1.2,
    lineHeightHeading2: 1.3,
    lineHeightHeading3: 1.4,
  },
  components: {
    Layout: {
      siderBg: '#0f172a',
      headerBg: '#ffffff',
      bodyBg: '#f8fafc',
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: '#1e3a5f',
      darkItemHoverBg: '#1e293b',
      itemHeight: 44,
      iconSize: 18,
      collapsedIconSize: 18,
    },
    Card: {
      paddingLG: 24,
      borderRadiusLG: 8,
    },
    Table: {
      headerBg: '#f1f5f9',
      headerColor: '#1e293b',
      headerSplitColor: '#e2e8f0',
      rowHoverBg: '#f8fafc',
      borderColor: '#e2e8f0',
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },
    Button: {
      primaryShadow: '0 2px 4px rgba(30, 58, 95, 0.2)',
      fontWeight: 500,
    },
    Input: {
      activeBorderColor: '#1e3a5f',
      hoverBorderColor: '#93a8c1',
    },
    Select: {
      optionSelectedBg: '#e8eef5',
    },
    Statistic: {
      contentFontSize: 28,
      titleFontSize: 14,
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Badge: {
      statusSize: 8,
    },
    Tabs: {
      inkBarColor: '#1e3a5f',
      itemActiveColor: '#1e3a5f',
      itemHoverColor: '#2d4a73',
      itemSelectedColor: '#1e3a5f',
    },
    Modal: {
      headerBg: '#ffffff',
      titleFontSize: 18,
    },
    Form: {
      labelFontSize: 14,
      verticalLabelPadding: '0 0 8px',
    },
  },
};

// Accent color for special actions (industrial orange)
export const accentColor = '#ea580c';
export const accentColorHover = '#dc4b0a';

// Status colors for manufacturing workflow
export const statusColors = {
  enquiry: { bg: '#f3e8ff', text: '#7c3aed', border: '#c4b5fd' },
  design: { bg: '#e0f2fe', text: '#0284c7', border: '#7dd3fc' },
  fabrication: { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
  assembly: { bg: '#ffedd5', text: '#ea580c', border: '#fdba74' },
  testing: { bg: '#ede9fe', text: '#7c3aed', border: '#c4b5fd' },
  delivered: { bg: '#dcfce7', text: '#16a34a', border: '#86efac' },
};

// Payment status colors
export const paymentStatusColors = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  paid: { bg: '#dcfce7', text: '#16a34a' },
  overdue: { bg: '#fee2e2', text: '#dc2626' },
};

// Purchase status colors
export const purchaseStatusColors = {
  ordered: { bg: '#e0f2fe', text: '#0284c7' },
  received: { bg: '#dcfce7', text: '#16a34a' },
  cancelled: { bg: '#f1f5f9', text: '#64748b' },
};

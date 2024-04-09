import QmoneyPaymentFamilyPanel from './components/QmoneyPaymentFamilyPanel';
import RequestPaymentPage from './pages/RequestPaymentPage';
import ConfirmPaymentPage from './pages/ConfirmPaymentPage';
import {
  ROUTE_TO_CONFIRM_PAYMENT_PAGE,
  ROUTE_TO_REQUEST_PAYMENT_PAGE
} from './constants';

const DEFAULT_CONFIG = {
  'core.Router': [
    { path: ROUTE_TO_REQUEST_PAYMENT_PAGE, component: RequestPaymentPage },
    { path: ROUTE_TO_CONFIRM_PAYMENT_PAGE, component: ConfirmPaymentPage }
  ],
  'insuree.FamilyOverview.panels': [QmoneyPaymentFamilyPanel]
};

export const QmoneyPaymentModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};

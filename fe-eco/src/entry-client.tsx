import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { createRouter } from './router';
import { AppProviders } from './AppProviders.client';

const router = createRouter();

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <AppProviders>
      <RouterProvider router={router} />
  </ AppProviders>
); 
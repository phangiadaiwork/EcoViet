import ReactDOMServer from 'react-dom/server';
import { RouterProvider } from 'react-router-dom';
import { createServerRouter } from './router';
import { AppProviders } from './AppServerProvider';

export function render(url: string, productSeo: any = null) {
  const helmetContext = { };
  const router = createServerRouter(url);
  
  const html = ReactDOMServer.renderToString(
    <AppProviders  helmetContext={helmetContext} product={productSeo}>
        <RouterProvider router={router}  />
      </AppProviders >
  );

  return { html, helmetContext };
} 
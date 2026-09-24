import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';
import { AppFrame } from '@/components/AppFrame';
import { StackOutlet } from '@/components/StackOutlet';
import { BookingProvider } from '@/hooks/use-booking';
import { Home } from '@/screens/home/Home';
import { Account } from '@/screens/pages/Account';
import { AddCard } from '@/screens/pages/AddCard';
import { Code } from '@/screens/pages/Code';
import { Name } from '@/screens/pages/Name';
import { Phone } from '@/screens/pages/Phone';
import { RidePreferences } from '@/screens/pages/RidePreferences';
import { Trips } from '@/screens/pages/Trips';
import { Wallet } from '@/screens/pages/Wallet';
import { Welcome } from '@/screens/pages/Welcome';

// Pages that open over Home. Home stays mounted under them, so its map is never reloaded.
const OVER_HOME = ['/home', '/account', '/trips', '/wallet', '/add-card', '/ride-preferences'];

const signedInGroup = (pathname: string) => (OVER_HOME.includes(pathname) ? 'home' : pathname);

function Root() {
  return (
    <AppFrame>
      <BookingProvider>
        <StackOutlet group={signedInGroup} />
      </BookingProvider>
    </AppFrame>
  );
}

function SignedIn() {
  return (
    <>
      <Home />
      <StackOutlet emptyPath="/home" />
    </>
  );
}

// Hash addresses (#/home) so GitHub Pages, which knows only index.html, serves every page.
const router = createHashRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <Welcome /> },
      { path: '/phone', element: <Phone /> },
      { path: '/code', element: <Code /> },
      { path: '/name', element: <Name /> },
      {
        element: <SignedIn />,
        children: [
          { path: '/home', element: null },
          { path: '/account', element: <Account /> },
          { path: '/trips', element: <Trips /> },
          { path: '/wallet', element: <Wallet /> },
          { path: '/add-card', element: <AddCard /> },
          { path: '/ride-preferences', element: <RidePreferences /> },
        ],
      },
    ],
  },
]);

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root');
createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

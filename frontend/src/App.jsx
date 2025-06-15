import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import userAtom from './atoms/userAtom';
import { Box } from '@chakra-ui/react';
import HomePage from './pages/HomePage';
import UserPage from './pages/UserPage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import CreateProductPage from './pages/CreateProductPage';
import ProductPage from './pages/ProductPage';
import CreateEventPage from './pages/CreateEventPage';
import EventPage from './pages/EventPage';
import UserArtGallery from './pages/UserArtGallery';
import ProductsPage from './pages/AllProductsPage';
import EventsPage from './pages/AllEventsPage';
import ExploreGalleries from './pages/GalleriesPage';
import CreateGalleryPage from './pages/CreateGallery';
import GalleryPage from './pages/UserArtGallery';
import { CartProvider } from './components/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AdminPanel from './pages/AdminPanel';
import FavoriteProductsPage from './pages/FavoriteProductsPage';
import UserAllProductsPage from './pages/UserAllProductsPage';
import UpdateProductPage from './pages/UpdateProductPage';
import BlockedUsersPage from './pages/BlockedUsersPage';
import useLoadGoogleMapsScript from './hooks/useLoadGoogleMapsScript';
import EditEventPage from './pages/EditEventPage';
import EditGalleryPage from './pages/EditGalleryPage';
import NotificationsPage from './pages/NotificationPage';
import UserArticlesPage from './pages/UserArticlesPage';
import ArticlePage from './pages/ArticlePage';
import CalendarPage from './pages/CalendarPage';
import ContactBar from './components/ContactBar';
import LoginCard from './components/LoginCard';
import UserAllGalleriesPage from './pages/UserAllGalleriesPage';
import UserAllEventsPage from './pages/UserAllEventsPage';
import FavoritesPage from './pages/FavoritesPage';
import CreateOrEditArticlePage from './pages/createArticle';
import AllArticlesPage from './pages/AllArticlesPage';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from './components/PageWrapper';
import MessagesPage from './pages/MessagesPage';

function App() {
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const apiKey = 'AIzaSyAy0C3aQsACcFAPnO-BK1T4nLpSQ9jmkPs';
  const { isLoaded } = useLoadGoogleMapsScript(apiKey);
  const location = useLocation();

  const isMessagesRoute = location.pathname.startsWith('/messages');

  return (
    <CartProvider>
      <Box minH="100vh">
        <Navbar />

        {isMessagesRoute ? (

          <Routes location={location}>
            {' '}
            <Route
              path="/messages"
              element={
                <PageWrapper>
                  <MessagesPage />
                </PageWrapper>
              }
            />
            <Route
              path="/messages/:userId"
              element={
                <PageWrapper>
                  <MessagesPage />
                </PageWrapper>
              }
            />

          </Routes>
        ) : (
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/home"
                element={
                  <PageWrapper>
                    <HomePage />
                  </PageWrapper>
                }
              />
              <Route
                path="/auth"
                element={
                  !user ? (
                    <PageWrapper>
                      <AuthPage />
                    </PageWrapper>
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/profile/:username"
                element={
                  <PageWrapper>
                    <UserPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/update"
                element={
                  user ? (
                    <PageWrapper>
                      <UpdateProfilePage />
                    </PageWrapper>
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/create/product"
                element={
                  <PageWrapper>
                    <CreateProductPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/products"
                element={
                  <PageWrapper>
                    <ProductsPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <PageWrapper>
                    <ProductPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/create/event"
                element={
                  user ? (
                    <PageWrapper>
                      <CreateEventPage />
                    </PageWrapper>
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/events/:id"
                element={
                  <PageWrapper>
                    <EventPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/events"
                element={
                  <PageWrapper>
                    <EventsPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/articles"
                element={
                  <PageWrapper>
                    <AllArticlesPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/art"
                element={
                  <PageWrapper>
                    <UserArtGallery />
                  </PageWrapper>
                }
              />

              <Route path="*" element={<Navigate to="/home" />} />
              <Route
                path="/galleries"
                element={
                  <PageWrapper>
                    <ExploreGalleries />
                  </PageWrapper>
                }
              />
              <Route
                path="/create/gallery"
                element={
                  <PageWrapper>
                    <CreateGalleryPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/galleries/:galleryId"
                element={
                  <PageWrapper>
                    <GalleryPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/notifications"
                element={
                  user ? (
                    <PageWrapper>
                      <NotificationsPage />
                    </PageWrapper>
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/cart"
                element={
                  <PageWrapper>
                    <CartPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/checkout"
                element={
                  <PageWrapper>
                    <CheckoutPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/orders"
                element={
                  <PageWrapper>
                    <OrdersPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/admin-panel"
                element={
                  <PageWrapper>
                    <AdminPanel />
                  </PageWrapper>
                }
              />
              <Route
                path="/:username/favorites"
                element={
                  <PageWrapper>
                    <FavoriteProductsPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/:username/all-products"
                element={
                  <PageWrapper>
                    <UserAllProductsPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/:username/all-galleries"
                element={
                  <PageWrapper>
                    <UserAllGalleriesPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/:username/all-events"
                element={
                  <PageWrapper>
                    <UserAllEventsPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/update/product/:id"
                element={
                  <PageWrapper>
                    <UpdateProductPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/blocked-users"
                element={
                  <PageWrapper>
                    <BlockedUsersPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/edit/event/:eventId"
                element={
                  <PageWrapper>
                    <EditEventPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/edit-gallery/:galleryId"
                element={
                  <PageWrapper>
                    <EditGalleryPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/:username/articles"
                element={
                  <PageWrapper>
                    <UserArticlesPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/articles/:articleId"
                element={
                  <PageWrapper>
                    <ArticlePage />
                  </PageWrapper>
                }
              />
              <Route
                path="/:username/calendar"
                element={
                  <PageWrapper>
                    <CalendarPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/login"
                element={
                  <PageWrapper>
                    <LoginCard />
                  </PageWrapper>
                }
              />
              <Route
                path="/favorites/:username"
                element={
                  <PageWrapper>
                    <FavoritesPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/create/article"
                element={
                  <PageWrapper>
                    <CreateOrEditArticlePage />
                  </PageWrapper>
                }
              />
              <Route
                path="/update/article/:id"
                element={
                  <PageWrapper>
                    <CreateOrEditArticlePage />
                  </PageWrapper>
                }
              />
            </Routes>
          </AnimatePresence>
        )}
        <ContactBar />
      </Box>
    </CartProvider>
  );
}

export default App;

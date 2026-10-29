import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  decrementCartItem,
  removeFromCart,
} from '../features/shoppingCart/shoppingCartSlice.js';
import {
  calculateTotalPrice,
  selectCartItems,
  selectProducts,
} from '../features/shoppingCart/shoppingCartSelectors.js';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function ShoppingCart() {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(calculateTotalPrice);

  const handleAddToCart = useCallback(
    (productId) => dispatch(addToCart(productId)),
    [dispatch],
  );
  const handleDecrement = useCallback(
    (productId) => dispatch(decrementCartItem(productId)),
    [dispatch],
  );
  const handleRemove = useCallback(
    (productId) => dispatch(removeFromCart(productId)),
    [dispatch],
  );

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="eyebrow">THE LITTLE EVERYDAY SHOP</span>
          <h1>Useful things, thoughtfully chosen.</h1>
          <p>Find a favorite or two for the days ahead.</p>
        </div>
        <a className="cart-link" href="#your-cart">
          Your cart <span>{cartItems.reduce((count, item) => count + item.quantity, 0)}</span>
        </a>
      </header>

      <div className="shop-layout">
        <section aria-labelledby="products-heading" className="products-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MADE FOR DAILY RITUALS</span>
              <h2 id="products-heading">A few good things</h2>
            </div>
            <span className="item-count">{products.length} items</span>
          </div>

          <ul className="product-grid">
            {products.map((product) => (
              <li className="product-card" key={product.id}>
                <div
                  aria-hidden="true"
                  className="product-art"
                  style={{ backgroundColor: product.color }}
                >
                  <span>{product.icon}</span>
                </div>
                <div className="product-info">
                  <div className="product-title-row">
                    <h3>{product.name}</h3>
                    <span>{currencyFormatter.format(product.price)}</span>
                  </div>
                  <p>{product.description}</p>
                  <button
                    className="add-button"
                    onClick={() => handleAddToCart(product.id)}
                    type="button"
                  >
                    Add to cart <span aria-hidden="true">+</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside aria-labelledby="cart-heading" className="cart-panel" id="your-cart">
          <div className="cart-heading">
            <div>
              <span className="eyebrow">ALL YOUR PICKS</span>
              <h2 id="cart-heading">Your cart</h2>
            </div>
            <span className="cart-item-count">
              {cartItems.reduce((count, item) => count + item.quantity, 0)}
            </span>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <span aria-hidden="true">○</span>
              <p>Your cart is waiting for something lovely.</p>
            </div>
          ) : (
            <ul className="cart-list">
              {cartItems.map((item) => (
                <li className="cart-item" key={item.id}>
                  <span
                    aria-hidden="true"
                    className="cart-item-art"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </span>
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <span>{currencyFormatter.format(item.price)} each</span>
                    <div
                      aria-label={`${item.name} quantity`}
                      className="quantity-control"
                    >
                      <button
                        aria-label={`Remove one ${item.name}`}
                        onClick={() => handleDecrement(item.id)}
                        type="button"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        aria-label={`Add one ${item.name}`}
                        onClick={() => handleAddToCart(item.id)}
                        type="button"
                      >
                        +
                      </button>
                      <button
                        aria-label={`Remove ${item.name} from cart`}
                        className="remove-button"
                        onClick={() => handleRemove(item.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <strong className="line-total">
                    {currencyFormatter.format(item.price * item.quantity)}
                  </strong>
                </li>
              ))}
            </ul>
          )}

          <div className="cart-total">
            <span>Total</span>
            <strong>{currencyFormatter.format(totalPrice)}</strong>
          </div>
          <button
            className="checkout-button"
            disabled={cartItems.length === 0}
            onClick={() => window.alert('Thanks for shopping!')}
            type="button"
          >
            Continue to checkout
          </button>
          <p className="cart-note">Shipping and taxes calculated at checkout.</p>
        </aside>
      </div>

      <footer className="page-footer">
        Thoughtful finds for a well-lived everyday.
      </footer>
    </main>
  );
}

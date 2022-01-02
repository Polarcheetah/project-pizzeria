import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
    console.log(thisCartProduct);
  }

  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget =
      thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.amountWidget
      );
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.price
    );
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.edit
    );
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.remove
    );
  }

  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );

    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;

      thisCartProduct.price =
        thisCartProduct.amount * thisCartProduct.priceSingle;

      thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.price
      ).innerHTML = thisCartProduct.price;

      //console.log('thisCartProduct.dom.price ', thisCartProduct.dom.price);
    });
  }

  remove() {
    const thisCartProduct = this;
    console.log('remove method called!');
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }
  getData() {
    const thisCartProduct = this;
    console.log(thisCartProduct);

    const productSummary = {};

    productSummary.id = thisCartProduct.id;
    productSummary.amount = thisCartProduct.amount;
    productSummary.price = thisCartProduct.price;
    productSummary.priceSingle = thisCartProduct.priceSingle;
    productSummary.name = thisCartProduct.name;
    productSummary.params = thisCartProduct.params;

    return productSummary;
  }
}

export default CartProduct;

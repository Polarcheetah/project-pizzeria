import { settings, select, templates, classNames } from '../settings.js';
import { utils } from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

    thisCart.formData = utils.serializeFormToObject(thisCart.dom.form);
    console.log('thisCart.formData', thisCart.formData);
  }

  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct) {
    const thisCart = this;

    /* generate HTML based on template*/
    const generatedHTML = templates.cartProduct(menuProduct);
    /* create element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /* add element to product list */
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log('thisCart.products', thisCart.products);

    thisCart.update();
  }
  update() {
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }
    console.log('thisCart.totalNumber:', thisCart.totalNumber);
    if (thisCart.totalNumber === 0) {
      thisCart.deliveryFee = 0;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    //console.log('thisCart.dom.totalPrice:', thisCart.dom.totalPrice);
    for (let price of thisCart.dom.totalPrice) {
      console.log(price);
      price.innerHTML = thisCart.totalPrice;
    }
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
  }
  remove(cartProduct) {
    const thisCart = this;
    //remove product from HTML
    const elementHTML = cartProduct.dom.wrapper;
    elementHTML.remove();

    //remove product info from thisCart.product array
    const indexOfProduct = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(indexOfProduct, 1);
    console.log('thisCart.products:', thisCart.products);
    //run update() method
    thisCart.update();
  }
  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;
    console.log('orders url:', url);

    const formData = utils.serializeFormToObject(thisCart.dom.form);
    //console.log('formData', formData);

    const payload = {};

    payload.address = formData.address[0];
    payload.phone = formData.phone[0];
    payload.totalPrice = thisCart.totalPrice;
    payload.subtotalPrice = thisCart.subtotalPrice;
    payload.totalNumber = thisCart.totalNumber;
    payload.deliveryFee = thisCart.deliveryFee;
    payload.products = [];

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    console.log('payload', payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }
}

export default Cart;

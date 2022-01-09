import { classNames, templates } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
  }

  render(element) {
    const thisHome = this;

    const generatedHTML = templates.homePage();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.carouselElement = thisHome.dom.wrapper.querySelector(
      classNames.home.carousel
    );
  }

  initWidgets() {
    const thisHome = this;

    thisHome.dom.carouselObject = new Flickity(thisHome.dom.carouselElement, {
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
    });
  }
}

export default Home;

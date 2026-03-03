import { Carousel, Image } from 'react-bootstrap'
import '../style/Carousel.css'

import image1 from '../assets/compressed/1.png';
import image2 from '../assets/compressed/2.png';
import image3 from '../assets/compressed/3.png';

function HomeCarousel() {
  return (
    <>
      <Carousel fade className='mt-3 pb-4'>
        <Carousel.Item className='custom-item'>
          <div className='split-container'>
            <div className='overlay'>
              <div className='overlay-content'>
                <h1>Pálinka</h1>
              </div>
            </div>
            <Image className='d-block w-100 carousel-img' src={image1} />
          </div>
        </Carousel.Item>
        <Carousel.Item className='custom-item'>
          <div className='split-container'>
            <div className='overlay'>
              <div className='overlay-content'>
                <h1>Rum</h1>
              </div>
            </div>
            <Image className='d-block w-100 carousel-img' src={image2} />
          </div>
        </Carousel.Item>
        <Carousel.Item className='custom-item'>
          <div className='split-container'>
            <div className='overlay'>
              <div className='overlay-content'>
                <h1>Bor</h1>
              </div>
            </div>
            <Image className='d-block w-100 carousel-img' src={image3} />
          </div>
        </Carousel.Item>
      </Carousel>
    </>
  )
}
export default HomeCarousel;
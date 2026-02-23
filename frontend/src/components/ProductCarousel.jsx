import { Carousel, Image } from 'react-bootstrap'
import '../style/Carousel.css'

function ProductCarousel({ images }) {
  return (
    <>
      <Carousel className='pb-4' interval={null} >
        {
          images.length > 1 ? (
            images.map((item, idx) => (
              <Carousel.Item className='' key={idx}>
                <Image className='d-block w-100 carousel-img' style={{ maxHeight: 270 }} src={item} />
              </Carousel.Item>
            ))
          ) : (
            <Carousel.Item className='custom-item'>
              <Image className='d-block w-100 carousel-img' style={{ maxHeight: 270 }} src={images[0]} />
            </Carousel.Item>
          )
        }
      </Carousel>
    </>
  )
}
export default ProductCarousel;
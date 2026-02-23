import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { Slider } from "antd";
import '../style/Products.css';
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../api/endpoints";
import { useSearchParams } from "react-router-dom";
import PaginationComponent from "../components/PaginationComponent";
import ProductCarousel from "../components/ProductCarousel";

const MAX = {
  ALCOHOL: 70,
  STOCK: 70,
  CONTENT: 1000,
  PRICE: 100000
}

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(() => {
    return localStorage.getItem('limit') || 6;
  });

  //const [sortBy, setSortBy] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(() => {
    return searchParams.get('page') || 1;
  });

  const getFiltersFromUrl = () => {
    return {
      minPrice: searchParams.get('minprice'),
      maxPrice: searchParams.get('maxprice'),
      minStock: searchParams.get('minstock'),
      maxStock: searchParams.get('maxstock'),
      minAlcohol: searchParams.get('minalcohol'),
      maxAlcohol: searchParams.get('maxalcohol'),
      minContent: searchParams.get('mincontent'),
      maxContent: searchParams.get('maxcontent'),
    };
  };

  const filters = getFiltersFromUrl();

  const handleSliderChange = (field) => (values) => {
    handleParamChange({
      [`min${field}`]: values[0],
      [`max${field}`]: values[1]
    });
  };

  const openDetails = () => {
    console.log('open');
  }

  const handleParamChange = (newParamsObject) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);

      Object.entries(newParamsObject).forEach(([key, value]) => {

        const isMinAtDefault = key.startsWith('min') && value === 0;
        const isMaxAtDefault = key.startsWith('max') && (
          (key.includes('alcohol') && value === MAX.ALCOHOL) ||
          (key.includes('price') && value === MAX.PRICE) ||
          (key.includes('stock') && value === MAX.STOCK) ||
          (key.includes('content') && value === MAX.CONTENT)
        );
        console.log(key, value)
        if (value !== null && value !== undefined && !isMinAtDefault && !isMaxAtDefault) {
          nextParams.set(key, value);
        } else {
          nextParams.delete(key);
        }
      });

      if (!newParamsObject.page) nextParams.set('page', '1');
      return nextParams;
    });
  };

  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.PRODUCTS.GET_ALL}?limit=${limit}&${searchParams.toString()}`);
        const data = await res.json();

        if (res.ok && !ignore) {
          setProducts(data.products);
          setTotalPages(data.pagination.totalPages);
        }
      } catch {
        if (!ignore) toast.error('Hiba történt az adatok betöltése közben!');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchProducts();
    return () => { ignore = true; }
  }, [searchParams, limit]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSearchParams({ 'page': pageNumber })
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Container fluid className="content-bg mt-3">
        <Row>
          <Col md='3' className='pt-3 col-sort'>
            <h3 className="sort-header">Szűrés</h3>
            <div>
              Alkoholtartalom (%)
              <Slider
                range
                step={5}
                tooltip={{ formatter: (value) => `${value}%` }}
                defaultValue={[filters.minAlcohol || 0, filters.maxAlcohol || MAX.ALCOHOL]}
                key={`alcohol-${filters.minAlcohol}-${filters.maxAlcohol}`}
                min={0}
                max={MAX.ALCOHOL}
                onChangeComplete={handleSliderChange('alcohol', 0, MAX.ALCOHOL)}
              />
            </div>
            <div>
              Űrtartalom (ml)
              <Slider
                range
                step={125}
                tooltip={{ formatter: (value) => `${value} ml` }}
                defaultValue={[filters.minContent || 0, filters.maxContent || MAX.CONTENT]}
                key={`content-${filters.minContent}-${filters.maxContent}`}
                min={0}
                max={MAX.CONTENT}
                onChangeComplete={handleSliderChange('content', 0, MAX.CONTENT)}
              />
            </div>
            <div>
              Elérhető mennyiség (db)
              <Slider
                range
                step={5}
                defaultValue={[filters.minStock || 0, filters.maxStock || MAX.CONTENT]}
                key={`stock-${filters.minStock}-${filters.maxStock}`}
                min={0}
                max={MAX.STOCK}
                onChangeComplete={handleSliderChange('stock', 0, MAX.STOCK)}
              />
            </div><div>
              Ár (Ft)
              <Slider
                range
                step={5000}
                tooltip={{ formatter: (value) => `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Ft` }}
                defaultValue={[filters.minPrice || 0, filters.maxPrice || MAX.PRICE]}
                key={`price-${filters.minPrice}-${filters.maxPrice}`}
                min={0}
                max={MAX.PRICE}
                onChangeComplete={handleSliderChange('price', 0, MAX.PRICE)}
              />
            </div>
          </Col>
          <Col md='9' className='pt-3 col-product'>
            <h3 className="sort-header mb-2">Termékek</h3>
            {
              loading
                ? (<Spinner animation='border' />)
                : (
                  products.length > 0 ?
                    (
                      <Row >
                        {
                          products.map((item, idx) => (
                            <Col md={4} key={idx}>
                              <Card className="mb-2 custom-card" onClick={openDetails}>
                                <ProductCarousel images={item.images} />
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Body>
                                  <Card.Text>
                                    Kiszerelés: {item.contentML} ml<br />
                                    Alkoholtartalom: {item.alcoholPercent}%<br />
                                    Raktáron: {item.stock} db<br />
                                    Ár: {item.priceHUF.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Forint<br />
                                  </Card.Text>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))
                        }
                      </Row>
                    )
                    : (<>Nem található termék</>)
                )
            }
            {
              products.length != 0 ?
                (
                  <>
                    <Row>
                      <Col md={12}>
                        <PaginationComponent
                          currentPage={currentPage}
                          handlePageChange={handlePageChange}
                          totalPages={totalPages}
                        />
                      </Col><Col>
                        Termékek oldalanként
                        <select
                          name="limit-select"
                          className="limit-select ms-2"
                          onChange={(val) => setLimit(val.target.value)}
                          defaultValue={6}
                        >
                          <option value={3}>3</option>
                          <option value={6}>6</option>
                          <option value={9}>9</option>
                          <option value={12}>12</option>
                        </select>
                      </Col>
                    </Row>
                  </>
                ) : (null)
            }

          </Col>
        </Row >
      </Container >
    </>
  )
}

export default Products;

/* eslint-disable no-unused-vars */
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { Slider } from "antd";
import '../style/Products.css';
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Pagination from 'react-bootstrap/Pagination';
import { ENDPOINTS } from "../api/endpoints";
import { useSearchParams } from "react-router-dom";


function Products() {

  const MAX = {
    ALCOHOL: 70,
    STOCK: 70,
    CONTENT: 1000,
    PRICE: 100000
  }

  const DEFAULT_FILTERS = {
    minPrice: null,
    maxPrice: MAX.PRICE,
    minStock: null,
    maxStock: MAX.STOCK,
    minAlcohol: null,
    maxAlcohol: MAX.ALCOHOL,
    minContent: null,
    maxContent: MAX.CONTENT,
  }

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 12;
  const [filters, setFilters] = useState(DEFAULT_FILTERS);


  const [sortBy, setSortBy] = useState('');

  const handleSliderChange = (field, min, max) => (values) => {
    setFilters(prev => ({
      ...prev,
      [`min${field}`]: values[0] === min ? null : values[0],
      [`max${field}`]: values[1] === max ? null : values[1]
    }));
  };

  const constructFilterParams = (filters) => {
    let filterList = '';
    Object.keys(filters).forEach((item) => {
      if (filters[item] !== null) {
        filterList += `&${item}=${filters[item]}`;
      }
    });
    return filterList;
  };


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const filterList = constructFilterParams(filters);
        const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.PRODUCTS.GET_ALL}?page=${currentPage}&limit=${limit}${filterList ? filterList : ''}`);
        const data = await res.json();

        if (res.ok) {
          setProducts(data.products);
          setTotalPages(data.pagination.totalPages);
          setSearchParams({ page: 1 });
        }
      }
      catch {
        toast.error('Hiba történt az adatok betöltése közben!');
      }
      finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, filters, setSearchParams]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSearchParams({ currentPage: pageNumber })
    window.scrollTo(0, 0);
  };

  const paginationItems = (current, total, onClick) => {
    let items = [];

    // első elem
    items.push(
      <Pagination.Item
        key={1}
        active={1 === current}
        onClick={() => onClick(1)}
      >
        {1}
      </Pagination.Item>
    )

    // ha messze az eleje '...'
    if (current > 3) {
      items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }

    // a jelenlegi oldal körüli számok
    for (let number = Math.max(2, current - 1); number <= Math.min(total - 1, current + 1); number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === current}
          onClick={() => onClick(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // ha messze a vége
    if (current < total - 2) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    }

    // utolsó oldal
    if (total > 1) {
      items.push(
        <Pagination.Item key={total} active={total === current} onClick={() => onClick(total)}>
          {total}
        </Pagination.Item>
      );
    }


    return items;
  }


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
                defaultValue={[filters.minAlcohol, filters.maxAlcohol]}
                min={0}
                max={MAX.ALCOHOL}
                onChangeComplete={handleSliderChange('Alcohol', 0, MAX.ALCOHOL)}
              />
            </div>
            <div>
              Űrtartalom (ml)
              <Slider
                range
                step={125}
                tooltip={{ formatter: (value) => `${value} ml` }}
                defaultValue={[filters.minContent, filters.maxContent]}
                min={0}
                max={MAX.CONTENT}
                onChangeComplete={handleSliderChange('Content', 0, MAX.CONTENT)}
              />
            </div>
            <div>
              Elérhető mennyiség (db)
              <Slider
                range
                step={5}
                defaultValue={[filters.minStock, filters.maxStock]}
                min={0}
                max={MAX.STOCK}
                onChangeComplete={handleSliderChange('Stock', 0, MAX.STOCK)}
              />
            </div><div>
              Ár (Ft)
              <Slider
                range
                step={5000}
                tooltip={{ formatter: (value) => `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Ft` }}
                defaultValue={[filters.minPrice, filters.maxPrice]}
                min={0}
                max={MAX.PRICE}
                onChangeComplete={handleSliderChange('Price', 0, MAX.PRICE)}
              />
            </div>
          </Col>
          <Col md='9' className='pt-3 col-product'>
            <h3 className="sort-header mb-2">Termékek</h3>
            {loading ? (<Spinner animation='border' />) : (null)}
            {products.length != 0 ?
              (
                <Row >
                  {
                    products.map(item => (
                      <Col md={3} key={item.ProdID}>
                        <Card className="mb-2">
                          <Card.Img alt="img"></Card.Img>
                          <Card.Title>{item.name}</Card.Title>
                          <Card.Body>
                            <Card.Text>
                              Kiszerelés: {item.contentML} ml<br />
                              Alkoholtartalom: {item.alcoholPercent}%<br />
                              Raktáron: {item.stock} db<br />
                              Ár: {item.priceHUF} Forint<br />
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  }
                </Row>
              )
              : (!loading ? (<>Nem található termék</>) : (null))
            }
            {
              products.length != 0 ?
                (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination >
                      <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                      <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                      {paginationItems(currentPage, totalPages, handlePageChange)}
                      <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                      <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                  </div>
                ) : (null)
            }
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Products;

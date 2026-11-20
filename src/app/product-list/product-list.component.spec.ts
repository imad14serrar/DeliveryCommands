import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { CartService } from '../service/cart-service/cart.service';
import { aProduct, setupTestBed } from '../testing/test-helpers';
import { ProductListComponent } from './product-list.component';

describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;
  let http: HttpTestingController;

  const products = [
    aProduct({ id: 1, name: 'T-shirt Adidas', category: { id: 1, code: '1', name: 'Vêtements' } }),
    aProduct({ id: 2, name: 'iPhone 12', category: { id: 3, code: '3', name: 'Téléphones' } }),
    aProduct({ id: 3, name: 'TV Samsung', stock: 0, category: { id: 2, code: '2', name: 'TV' } })
  ];

  beforeEach(() => {
    setupTestBed([ProductListComponent]);
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/products`).flush(products);
    http.expectOne(`${environment.apiUrl}/categories`).flush([]);
    fixture.detectChanges();
  });

  it('affiche les produits reçus de l\'API', () => {
    expect(fixture.nativeElement.querySelectorAll('.product-card').length).toBe(3);
  });

  it('filtre par recherche et par catégorie', () => {
    component.searchTerm = 'iphone';
    component.filterProducts();
    expect(component.filteredProducts.map(p => p.id)).toEqual([2]);

    component.searchTerm = '';
    component.selectedCategory = '1';
    component.filterProducts();
    expect(component.filteredProducts.map(p => p.id)).toEqual([1]);
  });

  it('désactive le bouton d\'un produit en rupture de stock', () => {
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.product-card button'));
    expect(buttons[2].disabled).toBeTrue();
  });

  it('ajoute au panier', () => {
    component.addToCart(products[0]);
    expect(TestBed.inject(CartService).items.length).toBe(1);
  });
});

import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Category } from '../data-interfaces/Category';
import { Product } from '../data-interfaces/Product';
import { CartService } from '../service/cart-service/cart.service';
import { DataService } from '../service/data-service/data.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  searchTerm = '';
  selectedCategory = ''; // '' = toutes les catégories
  products: Product[] = [];
  categories: Category[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  loadError = false;

  constructor(private dataService: DataService, private cartService: CartService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadCatalog();
  }

  loadCatalog(): void {
    this.loading = true;
    this.loadError = false;
    this.dataService.getProducts().subscribe({
      next: products => {
        this.products = products;
        this.filterProducts();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
    this.dataService.getCategories().subscribe(categories => (this.categories = categories));
  }

  filterProducts(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      (!term || p.name.toLowerCase().includes(term)) &&
      (!this.selectedCategory || p.category.code === this.selectedCategory)
    );
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filterProducts();
  }

  addToCart(product: Product): void {
    switch (this.cartService.add(product)) {
      case 'added':
        this.toastr.success(`« ${product.name} » a été ajouté au panier.`);
        break;
      case 'incremented':
        this.toastr.info(`Quantité de « ${product.name} » augmentée.`);
        break;
      case 'max-stock':
        this.toastr.warning(`Stock maximum atteint pour « ${product.name} ».`);
        break;
      case 'out-of-stock':
        this.toastr.warning('Ce produit est en rupture de stock.');
        break;
    }
  }
}

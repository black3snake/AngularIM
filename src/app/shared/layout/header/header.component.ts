import {Component, HostListener, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {CartService} from "../../services/cart.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {ProductService} from "../../services/product.service";
import {ProductType} from "../../../../types/product.type";
import {HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {FormControl} from "@angular/forms";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {


  searchField = new FormControl();
  showedSearch: boolean = false;
  products: ProductType[] = [];
  // searchValue: string = "";
  count: number = 0;
  isLogged: boolean = false;
  @Input() categories: CategoryWithTypeType[] = [];
  serverStaticPath = environment.serverStaticPath;

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private cartService: CartService,
              private productService: ProductService) {
    this.isLogged = this.authService.getIsLoggedIn()
  }

  ngOnInit(): void {
    this.searchField.valueChanges
      .pipe(
        debounceTime(500),
      )
      .subscribe(value => {
        if (value && value.length > 2) {
          this.productService.searchProducts(value)
            .subscribe({
              next: (data: ProductType[]) => {
                this.products = data;
                this.showedSearch = true;
              },
              error: (err: HttpErrorResponse) => {
                if (err.error && err.error.message) {
                  this._snackBar.open(err.error.message);
                } else {
                  this._snackBar.open('Ошибка ответа от сервера при поиске')
                }
              }
            })
        } else {
          this.products = [];
        }
      })

    this.authService.isLogged$.subscribe((isLogged: boolean) => {
      this.isLogged = isLogged;
    })

    this.cartService.getCartCount()
      .subscribe((data: { count: number } | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.count = (data as { count: number }).count;
      })

    this.cartService.count$
      .subscribe(count => {
        this.count = count;
      })
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();

        },
        error: () => {
          this.doLogout();
        }
      })
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы успешно вышли из системы');
    this.router.navigate(['/']);
  }

  // changeSearchValue(newValue: string) {
  //   this.searchValue = newValue;
  //
  //   if(this.searchValue && this.searchValue.length > 2) {
  //     this.productService.searchProducts(this.searchValue)
  //       .subscribe({
  //         next: (data: ProductType[]) => {
  //           this.products = data;
  //           this.showedSearch = true;
  //         },
  //         error: (err: HttpErrorResponse) => {
  //           if (err.error && err.error.message) {
  //             this._snackBar.open(err.error.message);
  //           } else  {
  //             this._snackBar.open('Ошибка ответа от сервера при поиске')
  //           }
  //         }
  //       })
  //   } else {
  //     this.products = [];
  //   }
  // }

  selectProduct(url: string) {
    this.router.navigate(['/product/' + url]);
    // this.searchValue = '';
    this.searchField.setValue('');
    this.products = [];
  }

  // changeShowedSearch(value: boolean): void {
  //   setTimeout(() => {
  //     this.showedSearch = value;
  //   }, 300)
  // }

  // декоратор
  @HostListener('document:click', ['$event'])
  click(event: Event) {
    if (this.showedSearch && (event.target as HTMLInputElement).className.indexOf('search-product') === -1) {
      this.showedSearch = false;
    }
  }
}

import {Component, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {OwlOptions} from "ngx-owl-carousel-o";
import {HttpErrorResponse} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  count: number = 1;
  recommendedProducts: ProductType[] = [];
  product!: ProductType;
  serverStaticPath: string = environment.serverStaticPath;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false,
  }

  constructor(private productService: ProductService, private activatedRoute: ActivatedRoute,
              private router: Router, private cartService: CartService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.productService.getProduct(params['url'])
        .subscribe({
          next: (data: ProductType) => {

            this.cartService.getCart()
              .subscribe((cartData: CartType) => {
                if (cartData) {
                  const productInCart = cartData.items.find(item => item.product.id === data.id);
                  if (productInCart) {
                    data.countInCart = productInCart.quantity;
                    this.count = data.countInCart;
                  }
                }

                this.product = data;
              })

          },
          error: (err: HttpErrorResponse) => {
            console.log(err);
            this.router.navigate(['/404']);
          }
        })

      })


    this.productService.getBestProducts()
      .subscribe({
        next: (data: ProductType[]) => {
          this.recommendedProducts = data;
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        }
      })
  }

  updateCount(value: number) {
    console.log(value);
    this.count = value;

    if (this.product.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType) => {
          this.product.countInCart = this.count;
        })
    }
  }

  addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType) => {
        this.product.countInCart = this.count;
      })
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType) => {
        this.product.countInCart = 0;
        this.count = 1;
      })
  }
}

import {Component, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {HttpErrorResponse} from "@angular/common/http";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {environment} from "../../../../environments/environment";
import {DefaultResponseType} from "../../../../types/default-response.type";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  extraProducts: ProductType[] = [];
  cartProducts: CartType | null = null;
  serverStaticPath: string = environment.serverStaticPath;
  totalAmount: number = 0;
  totalCount: number = 0;

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

  constructor(private productService: ProductService, private cartService: CartService) {
  }

  ngOnInit(): void {
    this.productService.getBestProducts()
      .subscribe({
        next: (data: ProductType[]) => {
          this.extraProducts = data;
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        }
      })

    this.cartService.getCart()
    .subscribe({
      next: (data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cartProducts = data as CartType;
        // console.log(this.cartProducts.items);
        this.calculateTotal();
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    })
  }

  calculateTotal() {
    this.totalAmount = 0;
    this.totalCount = 0;
    if (this.cartProducts) {
      this.cartProducts.items.forEach(item => {
        this.totalAmount += item.quantity * item.product.price;
        this.totalCount += item.quantity;
      })
    }
  }

  updateCount(id: string, value: number) {
    if (this.cartProducts) {
      this.cartService.updateCart(id, value)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.cartProducts = data as CartType;
          this.calculateTotal();
        })
    }
  }

}

import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DeliveryType} from "../../../../types/delivery.type";
import {FormBuilder, Validators} from "@angular/forms";
import {PaymentType} from "../../../../types/payment.type";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {OrderService} from "../../../shared/services/order.service";
import {OrderType} from "../../../../types/order.type";
import {UserService} from "../../../shared/services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  deliveryType: DeliveryType = DeliveryType.delivery;
  cartProducts: CartType | null = null;
  totalAmount: number = 0;
  totalCount: number = 0;
  deliveryTypes = DeliveryType;
  paymentTypes = PaymentType;
  count: number = 0;

  orderForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    fatherName: [''],
    phone: ['', Validators.required],
    paymentType: [PaymentType.cashToCourier, Validators.required],
    email: ['', [Validators.email, Validators.required]],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
    comment: ['']
  })

  get lastName() {
    return this.orderForm.get('lastName');
  }

  get firstName() {
    return this.orderForm.get('firstName');
  }

  get fatherName() {
    return this.orderForm.get('fatherName');
  }

  get phone() {
    return this.orderForm.get('phone');
  }

  get paymentType() {
    return this.orderForm.get('paymentType');
  }

  get email() {
    return this.orderForm.get('email');
  }

  get street() {
    return this.orderForm.get('street');
  }

  get house() {
    return this.orderForm.get('house');
  }

  get entrance() {
    return this.orderForm.get('entrance');
  }

  get apartment() {
    return this.orderForm.get('apartment');
  }

  get comment() {
    return this.orderForm.get('comment');
  }

  @ViewChild('popup') popup!: TemplateRef<ElementRef>;
  dialogRef: MatDialogRef<any> | null = null;

  constructor(private authService: AuthService,
              private router: Router,
              private cartService: CartService,
              private _snackBar: MatSnackBar,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private orderService: OrderService,
              private userService: UserService) {
    this.updateDeliveryTypeValidation()
  }

  ngOnInit(): void {
    this.cartService.getCart()
      .subscribe({
        next: (data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.cartProducts = data as CartType;
          if (!this.cartProducts || (this.cartProducts && this.cartProducts.items.length === 0)) {
            this._snackBar.open('Корзина пустая');
            this.router.navigate(['/']);
            return;
          }
          this.calculateTotal();
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        }
      })

    if (this.authService.getIsLoggedIn()) {

      this.userService.getUserInfo()
        .subscribe({
          next: (data: UserInfoType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }
            const userInfo = data as UserInfoType;
            const paramsToUpdate = {
              firstName: userInfo.firstName ? userInfo.firstName : '',
              lastName: userInfo.lastName ? userInfo.lastName : '',
              fatherName: userInfo.fatherName ? userInfo.fatherName : '',
              phone: userInfo.phone ? userInfo.phone : '',
              paymentType: userInfo.paymentType ? userInfo.paymentType : PaymentType.cashToCourier,
              email: userInfo.email ? userInfo.email : '',
              street: userInfo.street ? userInfo.street : '',
              house: userInfo.house ? userInfo.house : '',
              entrance: userInfo.entrance ? userInfo.entrance : '',
              apartment: userInfo.apartment ? userInfo.apartment : '',
              comment: ''
            }

            this.orderForm.setValue(paramsToUpdate)
            if (userInfo.deliveryType) {
              this.deliveryType = userInfo.deliveryType;
            }

          },
          error: (err: HttpErrorResponse) => {
            if (err.error && err.error.message) {
              this._snackBar.open(err.error.message);
            } else {
              this._snackBar.open('Ошибка чтения данных о пользователе')
            }
          }

        })

    }
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

  changeDeliveryType(type: DeliveryType) {
    this.deliveryType = type;

    this.updateDeliveryTypeValidation();
  }

  updateDeliveryTypeValidation() {
    if (this.deliveryType == DeliveryType.delivery) {
      this.street?.setValidators(Validators.required);
      this.house?.setValidators(Validators.required);
    } else {
      this.street?.removeValidators(Validators.required);
      this.house?.removeValidators(Validators.required);
      this.street?.setValue('');
      this.house?.setValue('');
      this.entrance?.setValue('');
      this.apartment?.setValue('');
    }

    this.street?.updateValueAndValidity();
    this.house?.updateValueAndValidity();
  }


  createOrder() {
    // if (this.orderForm.valid && this.firstName?.value && this.lastName?.value && this.phone?.value
    //   && this.email?.value && this.paymentType?.value) {

    if (this.orderForm.valid && this.orderForm.value.firstName && this.orderForm.value.lastName && this.orderForm.value.phone
      && this.orderForm.value.email && this.orderForm.value.paymentType) {

        // const paramObject: OrderType = {
        //   deliveryType: this.deliveryType,
        //   firstName: this.firstName.value,
        //   lastName: this.lastName.value,
        //   phone: this.phone.value,
        //   paymentType: this.paymentType.value,
        //   email: this.email.value,paymentType
        //   // fatherName: this.fatherName?.value,
        // }
        const paramObject: OrderType = {
          deliveryType: this.deliveryType,
          firstName: this.orderForm.value.firstName,
          lastName: this.orderForm.value.lastName,
          phone: this.orderForm.value.phone,
          email: this.orderForm.value.email,
          paymentType: this.orderForm.value.paymentType,
        }

        if (this.deliveryType === DeliveryType.delivery) {
          if (this.orderForm.value.street) {
            paramObject.street = this.orderForm.value.street;
          }
          if (this.orderForm.value.apartment) {
            paramObject.apartment = this.orderForm.value.apartment;
          }
          if (this.orderForm.value.house) {
            paramObject.house = this.orderForm.value.house;
          }
          if (this.orderForm.value.entrance) {
            paramObject.entrance = this.orderForm.value.entrance;
          }
        }

        if (this.orderForm.value.comment) {
          paramObject.comment = this.orderForm.value.comment;
        }
        if (this.orderForm.value.fatherName) {
          paramObject.fatherName = this.orderForm.value.fatherName;
        }


        this.orderService.createOrder(paramObject)
          .subscribe({
            next: (data: OrderType | DefaultResponseType) => {
              if ((data as DefaultResponseType).error !== undefined) {
                throw new Error((data as DefaultResponseType).message);
              }

              this.dialogRef = this.dialog.open(this.popup)
              this.dialogRef.backdropClick()
                .subscribe(() => {
                  this.router.navigate(['/']);
                })

              this.cartService.setCount(0);

            },
            error: (err: HttpErrorResponse) => {
              if (err.error && err.error.message) {
                this._snackBar.open(err.error.message);
              } else  {
                this._snackBar.open('Ошибка заказа')
              }
            }
          })
      } else {
      this.orderForm.markAllAsTouched();
      this._snackBar.open('Заполните необходимые поля формы');
    }

  }

  closePopup() {
    this.dialogRef?.close();
    this.router.navigate(['/']);
  }
}

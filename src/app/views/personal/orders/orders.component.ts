import {Component, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {OrderService} from "../../../shared/services/order.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OrderType} from "../../../../types/order.type";
import {OrderStatusUtil} from "../../../shared/utils/order-status.util";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  orders: OrderType[] = [];

  constructor(private orderService: OrderService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {

    this.orderService.getOrders()
      .subscribe({
        next: (data: OrderType[] | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.orders = (data as OrderType[]).map(item => {
            const status = OrderStatusUtil.getStatusAndColor(item.status)

            item.statusRus = status.name;
            item.color = status.color;

            return item
          });
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

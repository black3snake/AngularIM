import {Component, Input, OnInit} from '@angular/core';
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ActiveParamsType} from "../../../../types/active-params.type";

@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent implements OnInit {

  @Input() categoryWithTypes: CategoryWithTypeType | null = null;
  @Input() type: string | null = null;
  open: boolean = false;
  activeParams: ActiveParamsType = {types: []};

  from: number | null = null;
  to: number | null = null;

  get title(): string {
    if (this.categoryWithTypes) {
      return this.categoryWithTypes.name;
    } else if (this.type) {
      if (this.type === 'height') {
        return 'Высота';
      } else if (this.type === 'diameter') {
        return 'Диаметр'
      }
    }
    return '';
  }

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const activeParams: ActiveParamsType = {types: []};

      if(params.hasOwnProperty('types')) {
        activeParams.types = Array.isArray(params['types']) ? params['types'] : [params['types']];
      }
      if(params.hasOwnProperty('heightTo')) {
        activeParams.heightTo = params['heightTo'];
      }
      if(params.hasOwnProperty('heightFrom')) {
        activeParams.heightFrom = params['heightFrom'];
      }
      if(params.hasOwnProperty('diameterTo')) {
        activeParams.diameterTo = params['diameterTo'];
      }
      if(params.hasOwnProperty('diameterFrom')) {
        activeParams.diameterFrom = params['diameterFrom'];
      }
      if(params.hasOwnProperty('sort')) {
        activeParams.sort = params['sort'];
      }
      if(params.hasOwnProperty('page')) {
        activeParams.page = +params['page'];
      }

      this.activeParams = activeParams;

      if(this.type) {
        if (this.type === 'height') {
          this.open = !!(this.activeParams.heightFrom || this.activeParams.heightTo)
          this.from = this.activeParams.heightFrom ? +this.activeParams.heightFrom : null
          this.to = this.activeParams.heightTo ? +this.activeParams.heightTo : null
        } else if (this.type === 'diameter') {
          this.open = !!(this.activeParams.diameterFrom || this.activeParams.diameterTo)
          this.from = this.activeParams.diameterFrom ? +this.activeParams.diameterFrom : null
          this.to = this.activeParams.diameterTo ? +this.activeParams.diameterTo : null
        }
      } else {
        this.activeParams.types = params['types'];
      }



      console.log(this.activeParams);
    })
  }

  isTypeActive(typeUrl: string): boolean {
    return this.activeParams?.types?.includes(typeUrl) || false;
  }

  toggle(): void {
    this.open = !this.open;
  }

  updateFilterParam(url: string, checked: boolean): void {

    if (this.activeParams.types && this.activeParams.types.length > 0) {
      const existingTypeInParams = this.activeParams.types.find(item => item === url);
      if (existingTypeInParams && !checked) {
        this.activeParams.types = this.activeParams.types.filter(item => item !== url);
      } else if (!existingTypeInParams && checked) {
        // this.activeParams.types.push(url);
        this.activeParams.types = [...this.activeParams.types, url];
      }
    } else if (checked) {
      this.activeParams.types = [url];
    }
    // console.log(this.activeParams.types);

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });

  }

  updateFilterParamFromTo(param: string, value: string): void {

    if (param === 'heightTo' || param === 'heightFrom' || param === 'diameterTo' || param === 'diameterFrom') {
      if (this.activeParams[param] && !value) {
        delete this.activeParams[param];
      } else {
        this.activeParams[param] = value;
      }

      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      });
    }
  }
}

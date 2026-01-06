import {CountSelectorComponent} from "./count-selector.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";

describe("count selector", () => {

  let countSelectorComponent: CountSelectorComponent;
  let fixture: ComponentFixture<CountSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule( {
      imports: [FormsModule],
      declarations: [CountSelectorComponent],
    })
    fixture = TestBed.createComponent(CountSelectorComponent);
    countSelectorComponent = fixture.componentInstance;
  })

  it('should have count set', () => {
    expect(countSelectorComponent.count).toBeDefined();
  })

  it('should change value +1 after increasing', () => {
    countSelectorComponent.count = 1;
    countSelectorComponent.increaseCount();
    expect(countSelectorComponent.count).toBe(2);
  })

  it('should not decrease value if it is equal 1', () => {
    countSelectorComponent.count = 1;
    countSelectorComponent.decreaseCount();
    expect(countSelectorComponent.count).toBe(1);
  })

  it('should emit value +1 after increasing', (done: DoneFn) => {
    countSelectorComponent.count = 1;

    countSelectorComponent.onCountChange.subscribe(newValue => {
      expect(newValue).toBe(2);
      done();
    })
    countSelectorComponent.increaseCount();
  })

  it('should emit value -1 after decreasing', (done: DoneFn) => {
    countSelectorComponent.count = 5;

    countSelectorComponent.onCountChange.subscribe(newValue => {
      expect(newValue).toBe(4);
      done();
    })
    countSelectorComponent.decreaseCount();
  })

  it('should change value input after decreasing', (done: DoneFn) => {
    countSelectorComponent.count = 5;
    countSelectorComponent.decreaseCount();

    fixture.detectChanges(); // но мы должны дождаться пока эти изменения произойдут
    fixture.whenStable().then(() => {
      const componentElement: HTMLElement = fixture.nativeElement;  // содержит весь шаблон
      const inputElement: HTMLInputElement = componentElement.querySelector('input') as HTMLInputElement;
      expect(inputElement.value).toBe('4');
      done();
    })
  })

});


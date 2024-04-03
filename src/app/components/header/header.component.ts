import { Component, ElementRef, OnInit } from '@angular/core';
import { faPalette, faChevronDown, faSun, faMoon, faWater, faGem } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  faPalette = faPalette;
  faChevronDown = faChevronDown;
  faSun = faSun;
  faMoon = faMoon;
  faWater = faWater;
  faGem = faGem;
  ddListVisible: boolean | undefined = undefined;
  selectedTheme: string | null = 'light';

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    this.getTheme();
  }

  getTheme() {
    this.selectedTheme = localStorage.getItem('theme') != null ? localStorage.getItem('theme') : 'light';
  }

  ngAfterViewInit() {
    this.updateCheckedClass();
  }

  toggleListVisibility() {
    if (this.ddListVisible == undefined) {
      this.ddListVisible = true;
    } else {
      this.ddListVisible = !this.ddListVisible;
    }
  }

  changeTheme(theme: string) {
    this.selectedTheme = theme;
    localStorage.setItem('theme', this.selectedTheme);
    this.updateCheckedClass();
    setTimeout(() => {
      this.ddListVisible = !this.ddListVisible;
    }, 200);
    // this.ddListVisible = !this.ddListVisible;
  }

  updateCheckedClass() {
    var themeList = this.elRef.nativeElement.querySelectorAll('.drop-down-list .drop-down-item');
    themeList.forEach((item: any) => {
      if (item.id === this.selectedTheme) {
        item.classList.add('checked');
      } else {
        item.classList.remove('checked');
      }
    });
    //sm-screen
    var themeListSm = this.elRef.nativeElement.querySelectorAll('.drop-down-list-sm .drop-down-item');
    themeListSm.forEach((item: any) => {
      if (item.id === this.selectedTheme) {
        item.classList.add('checked');
      } else {
        item.classList.remove('checked');
      }
    });
  }
}

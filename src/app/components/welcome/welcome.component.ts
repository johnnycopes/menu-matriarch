import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  public user$ = this._userService.user$;

  constructor(
    private _userService: AuthService,
    private _router: Router,
  ) {}

  public ngOnInit(): void {
    this.user$.subscribe(console.log);
  }

  public async login(): Promise<void> {
    try {
      await this._userService.login();
      this._router.navigate(['/planner']);
    } catch (e) {
      console.error(e);
    }
  }

  public logout(): void {
    this._userService.logout();
  }
}

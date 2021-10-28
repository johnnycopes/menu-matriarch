import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  public user$ = this._userService.getUser();

  constructor(
    private _authService: AuthService,
    private _userService: UserService,
    private _router: Router,
  ) {}

  public ngOnInit(): void {
  }

  public async login(): Promise<void> {
    try {
      await this._authService.login();
      this._router.navigate(['/planner']);
    } catch (e) {
      console.error(e);
    }
  }
}

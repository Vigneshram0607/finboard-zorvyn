import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppRole } from '../models/transaction.model';
import { StorageService } from './storage.service';


@Injectable({ providedIn: 'root' })
export class RoleService {
  private _role$ = new BehaviorSubject<AppRole>(
    (this.storage.get<AppRole>('role')) ?? 'viewer'
  );
  role$ = this._role$.asObservable();

  get currentRole(): AppRole { return this._role$.getValue(); }
  get isAdmin(): boolean     { return this._role$.getValue() === 'admin'; }

  constructor(private storage: StorageService) {}

  setRole(role: AppRole): void {
    this._role$.next(role);
    this.storage.set('role', role);
  }
}

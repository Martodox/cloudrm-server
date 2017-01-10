import CreateNew from '/components/user-management/create-new';
import SessionManagment from '/components/user-management/session-managment';

export default class UserManagement {
  constructor() {
    new CreateNew();
    new SessionManagment();
  }
}
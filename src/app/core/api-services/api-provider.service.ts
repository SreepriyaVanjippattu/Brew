import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, zip, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../src/environments/environment';
import { map, catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiProviderService {
  protected resourceName: string;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'my-auth-token',
    }),
  };

  // api endpoints
  login = 'authorization/v1/login';
  getAllBrewRun = 'brewrun/v1/brewers/{0}/brewrun/';
  getAllActiveBrewUsers = 'user/v1/users/{0}/brewers';
  getBrewRunMasterDetails = 'brewrun/v1/brewers/{0}/brewrun/masterdetails';
  addBrewRun = 'brewrun/v1/brewers/{0}/brewrun';
  ChangeBrewRunStatus = 'brewrun/v1/brewers/{0}/brewrun/{1}';
  getBrewDetailsById = 'brewrun/v1/brewers/{0}/brewrun/{1}/details';
  editBrewRun = "brewrun/v1/brewers/{0}/brewrun/{1}"
  getAllArchievedBrewRun = 'brewrun/v1/brewers/{0}/brewrun/archived';
  getBrewRunMashinMasterDetails = 'brewrun/v1/brewers/{0}/brewrun/mashin/masterdetails'
  getBrewRunMashinDetails = 'brewrun/v1/brewers/{0}/brewrun/{1}/mashin/';
  mashin = 'brewrun/v1/brewers/{0}/brewrun/{1}/mashin/'
  getBrewLogMasterDetails = 'brewrun/v1/brewers/{0}/brewrun/brewlog/masterdetails'
  getBrewLogDetails = 'brewrun/v1/brewers/{0}/brewrun/{1}/brewlog/'



  getSubscriptions = 'GetAllActiveSubscription';

  // Signup Api/
  isCompanyNameAvailable = 'IsCompanyNameAvailable';
  initilizeClient = 'InitilizeClient';
  // Clients Api/
  getAllActiveClients = 'GetAllActiveClients';
  addClient = 'AddClient';
  editClient = 'EditClient';
  getAllArchivedClients = 'GetAllArchivedClients';

  editClientStatus = 'EditClientStaus';


  // User Api/
  getAllActiveUsers = 'user/v1/brewers/{0}/users';
  editUser = 'user/v1/brewers/{0}/user';
  addUser = 'user/v1/brewers/{0}/user';
  deleteUsers = 'user/v1/brewers/user/delete';
  resetUserPassword = 'ResetUserPassword';
  // Profile
  changeProfilePassword = 'EditUserPassword';

  // Role Permissions
  getAllActiveRoles = 'user/v1/brewers/{0}/roles';
  getAllPermissions = 'user/v1/brewers/role/permission';
  addRole ='user/v1/brewers/{0}/role'
  editRoles = 'user/v1/brewers/{0}/role';
  // get all Tenants/
  getAllTenantContent = 'GetAllTenentStatus';
  editClientSettings = 'EditClientSettings';
  editGeneralSettings = 'EditGeneralSettings';

  editSubcriptions = 'EditSubscription';
 
  // Units


  // preference
  getPreferenceSettings = 'user/v1/brewers/settings/{0}/preference';
  getAllPreferenceMasterDetails = 'brewrun/v1/brewers/settings/{0}/preferenceSettings';
  addPreference = 'user/v1/brewers/{0}/preference/';
  addYeastStrain = 'brewrun/v1/brewers/{0}/yeastStrains';
  addTankConfiguration = 'brewrun/v1/brewers/{0}/tank/';
  getAllTankConfigurationList = 'brewrun/v1/brewers/{0}/tanksDetails';
  getAllYeastList = 'brewrun/v1/brewers/{0}/yeastStrainsDetails';
  editTankConfiguration = 'brewrun/v1/brewers/{0}/tank/{1}';
  editYeastStrain = 'brewrun/v1/brewers/{0}/yeastStrains/{1}';

  // recipe
  getAllRecipeByTenant = 'brewrun/v1/brewers/recipe/{0}';
  getRecipebyId = 'brewrun/v1/brewers/recipe/{0}/{1}';
  addRecipe = 'brewrun/v1/brewers/{0}/recipe/';
  saveEditedRecipe = 'brewrun/v1/brewers/{0}/recipe/{1}';
  commitRecipe = 'brewrun/v1/brewers/{0}/recipe/{1}/commit';
  favoriteRecipe = 'brewrun/v1/brewers/{0}/recipe/{1}/favorite';
  cloneRecipe = 'brewrun/v1/brewers/{0}/recipe/{1}/clone';
  deleteRecipe = 'brewrun/v1/brewers/{0}/recipe/{1}';
  getAllArchivedRecipes = 'brewrun/v1/brewers/recipe/{0}/archived';
  archivedRecipe = 'brewrun/v1/brewers/{0}/recipe/{1}/archive';
  getAllYeastStrains = 'brewrun/v1/brewers/{0}/yeastStrains';
  getRecipeMasterDetails='brewrun/v1/brewers/{0}/recipe/masterdetails'

  getAllActiveCountry = 'brewrun/v1/brewers/settings/country';
  getAllActiveAddIn = 'brewrun/v1/brewers/recipe/{0}/addin';
  getAllActiveSupplier = 'brewrun/v1/brewers/{0}/suppliers';
  getAllActiveMaltGrainType = 'brewrun/v1/brewers/recipe/{0}/maltgraintype';
  getAllActiveUnitType = 'brewrun/v1/brewers/settings/unittype';
  getAllActiveStyle = 'brewrun/v1/brewers/settings/{0}/styles';


  changeBrewRunStatus = 'ChangeBrewRunStatus';
  getAllArchivedUsers = 'user/v1/brewers/user/{0}/archived';
  getBrewRunById = 'GetBrewRunById';
  GetAllAvailableTankList = 'GetAllAvailableTankList';
  getAllMaltGrainName = 'GetAllMaltGrainNameByTenantId';
  GetAllAvailableTankListInFermentation = 'GetAllAvailableTankListInFermentation';

  // Forgot Password
  editForgotPassword = 'ResetForgotPassword';
  postEmail = 'ForgotPasswordLink';


  addStyle = 'brewrun/v1/brewers/{0}/style/';
  addType = 'brewrun/v1/brewers/{0}/maltGrainType/';
  addSupplier = 'brewrun/v1/brewers/{0}/supplier/';

  logoutApi = 'Logout';

  // Report login logout
  getAllLoginLogoutReport = 'GetAllLoginLogoutReport';
  // copy
  recipeCopy = 'RecipeCopyRecipeById';
  // audit trail report
  getAllAuditTrailReport = 'GetUserAuditTrail';
  addBrewUserAuditTrail = 'AddBrewUserAuditTrail';
  // active client report
  getAllActiveClientsReport = 'GetAllActiveClientsReport';
  // subscription report
  getAllTenantSubscriptionReport = 'GetAllTenantSubscriptionReport'
  // GetAllActiveBrewUsers in new bew add


  getAllBrewReportsList = 'GetAllBrewRunByTenantIdForRepor';
  getAllLastRunReportList = 'GetAllLastRunReportList';

  constructor(public http: HttpClient) { }

  add(formData, endpoint: string) {
    const url = `${environment.API.URL}/${endpoint}`;
    return this.http.post(url.toString(), formData).pipe(
      map(response => response),
      retry(3),
      catchError(this.handleError),
    );
  }

  list(
    endpoint?: string,
    pageSize?: string,
    offset?: string,
    sortOrder?,
    sortBy?,
    search?: string,
    tenant?,
    fromDate?,
    toDate?,
    status?,
  ): Observable<any> {
    const url = new URL(`${environment.API.URL}/${endpoint}`);
    url.searchParams.set('pageSize', pageSize);
    url.searchParams.set('offset', offset);
    if (search !== '') {
      url.searchParams.set('search', search);
    }
    if (tenant && tenant !== '') {
      url.searchParams.set('tenantId', tenant);
    }
    if (fromDate && fromDate !== '') {
      url.searchParams.set('fromDate', fromDate);
    }
    if (toDate && toDate !== '') {
      url.searchParams.set('toDate', toDate);
    }
    if (status === 'active') {
      url.searchParams.set('status', 'true');
    } else if (status === 'inactive') {
      url.searchParams.set('status', 'false');
    }
    if (sortOrder) {
      url.searchParams.set('sortOrder', sortOrder);
    }
    if (sortBy) {
      url.searchParams.set('sortBy', sortBy);
    }
    return this.http.get(url.toString()).pipe(
      map(response => response),
      retry(3),
      catchError(this.handleError),
    );
  }

  getDataByParams(endpoint: string, tenantId?: any, startwith?: any): Observable<any> {
    const url = new URL(`${environment.API.URL}/${endpoint}`);

    if (tenantId) {
      url.searchParams.set('TenantId', tenantId);
    }
    if (startwith) {
      url.searchParams.set('startwith', startwith);
    }

    return this.http.get(url.toString(), { observe: 'response' }).pipe(
      map((response) => response),
      retry(3),
      catchError(this.handleError),
    );
  }

  getData(endpoint: string, pageNumber?: any, pageSize?: any, tenantId?: any, recipeId?: any, brewId?: any): Observable<any> {
    const url = new URL(`${environment.API.URL}/${endpoint}`);
    if (pageNumber) {
      url.searchParams.set('pageNumber', pageNumber);
    }

    if (pageSize) {
      url.searchParams.set('pageSize', pageSize);
    }
    if (tenantId) {
      url.searchParams.set('TenantId', tenantId);
    }

    if (recipeId) {
      url.searchParams.set('recipeId', recipeId);
    }

    if (brewId) {
      url.searchParams.set('brewId', brewId);
    }

    return this.http.get(url.toString(), { observe: 'response' }).pipe(
      map((response) => response),
      retry(3),
      catchError(this.handleError),
    );
  }

  getDataList(endpoint: string, pageNumber?: any, pageSize?: any, tenantId?: any, recipeId?: any, searchText?: any): Observable<any> {

    let url = new URL(`${environment.API.URL}/${endpoint}`);

    if (tenantId) {
      url = new URL(`${url}/${tenantId}`);
    }

    if (recipeId) {
      url = new URL(`${url}/${recipeId}`);
    }

    if (pageNumber) {
      url.searchParams.set('pageNumber', pageNumber);
    }

    if (pageSize) {
      url.searchParams.set('pageSize', pageSize);
    }

    if (searchText) {
      url.searchParams.set('searchText', searchText);
    }

    return this.http.get(url.toString(), { observe: 'response' }).pipe(
      map((response) => response),
      retry(3),
      catchError(this.handleError),
    );
  }

  getDataByQueryParams(endpoint: string, recipeId?: any, tenantId?: any, brewId?: any, pageNumber?: any, pageSize?: any, searchText?: any): Observable<any> {

    let url = `${environment.API.URL}/${endpoint}?`;

    if (pageNumber) {
      url = url + 'pageNumber=' + pageNumber;
    }

    if (pageSize) {
      url = url + '&pageSize=' + pageSize;
    }

    if (recipeId) {
      url = url + '&recipeId=' + recipeId;
    }

    if (tenantId) {
      url = url + '&tenantId=' + tenantId;
    }

    if (brewId) {
      url = url + '&brewId=' + brewId;
    }

    if (searchText) {
      url = url + '&searchText=' + searchText;
    }

    let formattedURL = url.toString();
    return this.http.get(formattedURL, { observe: 'response' }).pipe(
      map((response) => response),
      retry(3),
      catchError(this.handleError),
    );
  }

  getJsonData(url): Observable<any> {
    return this.http.get(url, { observe: 'response' }).pipe(
      map((response) => response),
      retry(3),
      catchError(this.handleError),
    );
  }



  getDataByID(url, id): Observable<string> {
    if (id || id === 0) {
      url.searchParams.set('id', id);
    }
    return (
      this.http
        .get(url.toString(), { observe: 'response' })
        .pipe(
          map((response: any) => {
            return response;
          }),
          catchError(this.handleError),
        )
    );
  }

  getList(url, limit?, offset?, sort_field?, sort_direction?): Observable<string> {
    if (limit || limit === 0) {
      url.searchParams.set('limit', limit);
    }
    if (offset || offset === 0) {
      url.searchParams.set('offset', Number(offset) * limit);
    }
    if (sort_field || sort_field === 0) {
      url.searchParams.set('sort_field', sort_field);
    }
    if (sort_direction || sort_direction === 0) {
      url.searchParams.set('sort_direction', sort_direction);
    }
    return (
      this.http
        .get(url, { observe: 'response' })
        .pipe(
          map((response: any) => {
            return response;
          }),
        )
    );
  }

  postData(endpoint, params?): Observable<string> {
    const url = `${environment.API.URL}/${endpoint}`;
    return (
      this.http
        .post(url, params, { observe: 'response' })
        .pipe(
          map((response: any) => {
            return response;
          }),
          catchError(this.handleError),
        )
    );
  }

  putData(endpoint, params): Observable<string> {
    const apiUrl = `${environment.API.URL}/${endpoint}`;
    return (
      this.http
        .put(apiUrl, params, { observe: 'response' })
        .pipe(
          map((response: any) => {
            return response;
          }),
          catchError(this.handleError),
        )
    );
  }

  deleteData(endpoint, anyObject?): Observable<any> {
    const url = new URL(`${environment.API.URL}/${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: anyObject,
    };
    return this.http.delete(url.toString(), httpOptions).pipe(
      map((response) => response),
      retry(3),
      catchError(this.handleError),
    );
  }

  patchData(endpoint, params?): Observable<string> {
    const apiUrl = `${environment.API.URL}/${endpoint}`;

    return (
      this.http
        .patch(apiUrl, params, { observe: 'response' })
        .pipe(
          map((response: any) => {
            return response;
          }),
          catchError(this.handleError),
        )
    );
  }



  headerTitle;
  breadCrumbs;
  private headerTitleSubject$ = new BehaviorSubject<any>(this.headerTitle);
  headerTitleChanged$ = this.headerTitleSubject$.asObservable();
  private breadCrumbsSubject$ = new BehaviorSubject<any>(this.breadCrumbs);
  breadCrumbsChanged$ = this.breadCrumbsSubject$.asObservable();
  changeHeaderTitle(title, breadCrumb) {
    this.headerTitle = title;
    this.headerTitleSubject$.next(title);
    this.breadCrumbs = breadCrumb;
    this.breadCrumbsSubject$.next(breadCrumb);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 400) {
      return throwError(error);
    } else if (error.error instanceof ErrorEvent) {
      return throwError(error);
    } else {
      return throwError(error);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }

  /**
   * Handle internal errors (uncaught errors)
   * param {HttpErrorResponse} error
   */
  handleInternalError(error: HttpErrorResponse) {
    this.presentErrorAlert('Internal error');
  }

  /**
   * Handle form validation errors
   * param {HttpErrorResponse} error
   */
  handleFormError(error: HttpErrorResponse) {
    const errors = [];
    const failedFields = JSON.parse(error.error).errors;

    for (const field in failedFields) {
      if (failedFields.hasOwnProperty(field)) {
        errors.push(failedFields[field]);
      }
    }
    const message = errors.join(' ');

    this.presentErrorAlert(message);
  }

  /**
   * Handle Offline Errors
   * param {HttpErrorResponse} error
   */
  handleOfflineError(error: HttpErrorResponse) {
    this.presentErrorAlert('Offline Errors');
  }

  /**
   * Present an error alert containing given message
   * param {string} message
   */
  private presentErrorAlert(message: string) {
    alert(message);
    // @todo: Implement an AlertController
  }

  /**
   *
   * param {string} query
   * param {PaginationParameters} page
   * param {Array<string>} columns
   * param {Array<string>} include
   * param sortBy
   * returns {Observable<Collection<TModel extends Model>>}
   */
  public search(
    query: string,
    page: string,
    columns?: string,
    include?: string,
    sortBy?: string,
  ): Observable<any> {
    query = encodeURI(query);
    const url = `${environment.API.URL}/${this.resourceName}/search/${query}`;

    return this.list(page, columns, include, sortBy, url);
  }

  /**
   * param {string | number} id
   * param data
   * param include
   * returns {Observable<TModel extends Model>}
   */
  public update(
    id: string | number,
    data: any,
    include?: Array<string>,
  ): Observable<any> {
    const url = new URL(`${environment.API.URL}/${this.resourceName}/${id}`);

    if (include) {
      url.searchParams.set('include', include.join(','));
    }

    return this.http.patch(url.toString(), data).pipe(
      map(response => {
        return response;
      }),
    );
  }

  /**
   * param data
   * returns {Observable<TModel extends Model>}
   */
  public create(data: any): Observable<any> {
    const url = new URL(`${environment.API.URL}/${this.resourceName}`);

    return this.http.post(url.toString(), data).pipe(
      map(response => {
        return response;
      }),
    );
  }

  /**
   * Try to destroy given models, and return an array with the destroyed
   * models.
   * param {Array<TModel extends Model>} models
   * returns {Observable<Array<number>>}
   */
  public destroy(models: Array<any>): Observable<Array<any>> {
    const requests: Array<Observable<any>> = models.map(model => {
      const url = new URL(
        `${environment.API.URL}/${this.resourceName}/${model.primary_key}`,
      );

      return this.http.delete<Array<boolean>>(url.toString()).pipe(
        map(response => {
          return {
            id: model.primary_key,
            destroyed: response,
          };
        }),
      );
    });

    return zip(...requests);
  }
  // used in report section
  loginUserList(endpoint: string, CurrentUser?, fromDate?, toDate?, sub_package?, status?): Observable<any> {
    const url = new URL(`${environment.API.URL}/${endpoint}`);

    if (CurrentUser && CurrentUser !== '') {
      url.searchParams.set('CurrentUser', CurrentUser);
    }
    if (fromDate && fromDate !== '') {
      url.searchParams.set('fromDate', fromDate);
    }
    if (toDate && toDate !== '') {
      url.searchParams.set('toDate', toDate);
    }
    if (sub_package && sub_package !== '') {
      url.searchParams.set('package', sub_package);
    }
    if (status && status !== '') {
      url.searchParams.set('statusParam', status);
    }

    return this.http.get(url.toString(), { observe: 'response' }).pipe(
      map(response => response),
      retry(3),
      catchError(this.handleError),
    );
  }
  // used in audit trail
  auditTrailList(endpoint: string, fromDate?, toDate?, CurrentUser?, activity?): Observable<any> {
    const url = new URL(`${environment.API.URL}/${endpoint}`);

    if (CurrentUser && CurrentUser !== '') {
      url.searchParams.set('CurrentUser', CurrentUser);
    }
    if (fromDate && fromDate !== '') {
      url.searchParams.set('fromDate', fromDate);
    }
    if (toDate && toDate !== '') {
      url.searchParams.set('toDate', toDate);
    }

    if (activity && activity !== '') {
      url.searchParams.set('activity', activity);
    }
    return this.http.get(url.toString(), { observe: 'response' }).pipe(
      map(response => response),
      retry(3),
      catchError(this.handleError),
    );
  }
  // used in active client
  activeClientList(endpoint: string, CurrentUser?, fromDate?, toDate?, package_pack?, package_city?, package_province?, expiryDate?):
    Observable<any> {
    const url = new URL(`${environment.API.URL}/${endpoint}`);

    if (CurrentUser && CurrentUser !== '') {
      url.searchParams.set('CurrentUser', CurrentUser);
    }
    if (fromDate && fromDate !== '') {
      url.searchParams.set('fromDate', fromDate);
    }
    if (toDate && toDate !== '') {
      url.searchParams.set('toDate', toDate);
    }

    if (package_pack && package_pack !== '') {
      url.searchParams.set('package', package_pack);
    }

    if (package_city && package_city !== '') {
      url.searchParams.set('city', package_city);
    }

    if (package_province && package_province !== '') {
      url.searchParams.set('province', package_province);
    }

    if (expiryDate && expiryDate !== '') {
      url.searchParams.set('expiryDate', expiryDate);
    }
    return this.http.get(url.toString(), { observe: 'response' }).pipe(
      map((response) => response),
      retry(3),
      catchError(this.handleError),
    );
  }
}

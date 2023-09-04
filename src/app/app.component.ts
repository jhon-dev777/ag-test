import { Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridReadyEvent,
  CellClickedEvent,
  ICellRendererParams,
  IDatasource,
  IGetRowsParams,
  RowModelType,
} from 'ag-grid-community';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IOlympicData } from './interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public columnDefs: ColDef[] = [
    // this row shows the row index, doesn't use any data from the row
    {
      headerName: 'ID',
      maxWidth: 100,
      // it is important to have node.id here, so that when the id changes (which happens
      // when the row is loaded) then the cell is refreshed.
      valueGetter: 'node.id',
      cellRenderer: (params: ICellRendererParams) => {
        if (params.value !== undefined) {
          return params.value;
        } else {
          return '<img src="https://www.ag-grid.com/example-assets/loading.gif">';
        }
      },
    },
    { field: 'id', minWidth: 150 },
    { field: 'ibu' },
    { field: 'name', minWidth: 150 },
    { field: 'year' },
    { field: 'date', minWidth: 150 },
    { field: 'sport', minWidth: 150 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
  public defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    minWidth: 100,
  };
  public rowBuffer = 0;
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public rowModelType: RowModelType = 'infinite';
  public cacheBlockSize = 0;
  public cacheOverflowSize = 2;
  public maxConcurrentDatasourceRequests = 1;
  public infiniteInitialRowCount = 1000;
  public maxBlocksInCache = 10;
  public rowData!: IOlympicData[];
  public page = 1;

  public dataSource = {
    getRows: (params: IGetRowsParams) => {
      this.http
        .get<[]>(
          `https://api.punkapi.com/v2/beers?page=${this.page}&per_page=50`
        )
        .subscribe((data) => {
          this.page = this.page + 1;
          params.successCallback(data, -1);
        });
    },
  };
  constructor(private http: HttpClient) {}

  onGridReady(params: GridReadyEvent<IOlympicData>) {
    console.log('new params');
    this.http
      .get<[]>(`https://api.punkapi.com/v2/beers?page=${this.page}&per_page=50`)
      .subscribe((data) => {
        this.page = this.page + 1;
        const dataSource: IDatasource = {
          rowCount: undefined,
          getRows: (params: IGetRowsParams) => {
            console.log(
              'asking for ' + params.startRow + ' to ' + params.endRow
            );
            // At this point in your code, you would call the server.
            // To make the demo look real, wait for 500ms before returning
            setTimeout(function () {
              // take a slice of the total rows
              const rowsThisPage = data.slice(params.startRow, params.endRow);
              // if on or after the last page, work out the last row.
              let lastRow = -1;
              if (data.length <= params.endRow) {
                lastRow = data.length;
              }
              // call the success callback
              params.successCallback(data, -1);
            }, 500);
          },
        };
        params.api!.setDatasource(dataSource);
      });
  }
}

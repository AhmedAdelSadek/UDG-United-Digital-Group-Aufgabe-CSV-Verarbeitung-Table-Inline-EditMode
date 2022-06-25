import { Component, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { IElements } from "src/app/interfaces/IElements";
import { ExportService } from "src/app/services/export.service";
import { ImportService } from "src/app/services/import.service";
import { DialogBoxComponent } from "../DialogBox/DialogBox.component";

@Component({
  selector: "app-Table",
  templateUrl: "./Table.component.html",
  styleUrls: ["./Table.component.scss"],
})
export class TableComponent {
  form: any;
  constructor (
    public exportService: ExportService,
    public dialog: MatDialog,
    public importService: ImportService,
    private _router: Router,
    private fb: FormBuilder
  ) {
    this.getColNames();
  }
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<any>;
  // solve Problem MatSort is undifined
  @ViewChild(MatSort) set MatSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  dataList: any[] = [];
  // To keep array of column names
  tableColumns!: string[];
  // Table edit feature variables
  tableFromGroup: FormGroup;
  controlOffset: number = 0;
  controlIndex: any = {};
  isEditMode = false;
  fcm: string; //formControlMapKey
  isHidden: boolean = true;
  // Column definition object
  displayedColumns = [
    {
      name: "Id",
      title: "ID",
      disableEdit: false,
    },
    {
      name: "Artikelname",
      title: "Product Name",
      disableEdit: false,
    },
    {
      name: "Aermel",
      title: "Sleeve",
      disableEdit: false,
    },
    {
      name: "Geschlecht",
      title: "Gender",
      disableEdit: false,
    },
    {
      name: "Beschreibung",
      title: "Description",
      disableEdit: false,
    },
    {
      name: "Produktart",
      title: "Product Type",
      disableEdit: false,
    },
    {
      name: "Grammatur",
      title: "Grammage",
      disableEdit: false,
    },
    {
      name: "Hauptartikelnr",
      title: "Main Item No.",
      disableEdit: false,
    },
    {
      name: "Hersteller",
      title: "Manufacturer",
      disableEdit: false,
    },
    {
      name: "Herstellung",
      title: "Manufacturing",
      disableEdit: false,
    },
    {
      name: "Bildname",
      title: "Image Name",
      disableEdit: false,
    },
    {
      name: "Kragen",
      title: "Collar",
      disableEdit: false,
    },
    {
      name: "Material",
      title: "Material",
      disableEdit: false,
    },
    {
      name: "Materialangaben",
      title: "Material Specifications",
      disableEdit: false,
    },
    {
      name: "Bein",
      title: "Leg",
      disableEdit: false,
    },
    {
      name: "Taschenart",
      title: "Bag type",
      disableEdit: false,
    },
    {
      name: "Ursprungsland",
      title: "Country of Origin",
      disableEdit: false,
    },
  ];
  // when adding new Item
  object: IElements = {
    Artikelname: "",
    Bein: "",
    Beschreibung: "",
    Bildname: "",
    Geschlecht: "",
    Grammatur: "",
    Hauptartikelnr: "",
    Hersteller: "",
    Herstellung: "",
    Kragen: "",
    Material: "",
    Materialangaben: "",
    Produktart: "",
    Taschenart: "",
    Ursprungsland: "",
    Aermel: "",
  };
  /**
   * Fetch column names from definition
   */
  getColNames() {
    this.tableColumns = this.displayedColumns.map((col) => {
      return col.name;
    });
  }
  /**
   * Get first key name from data source to generate FormControl Pointer
   */
  getFirstColName() {
    this.fcm = Object.keys(this.dataList[0])[0]; // Id
  }
  /**
   * Toggle edit mode
   */
  toggleEdit() {
    this.isEditMode = !this.isEditMode;
  }
  /**
   * Generate dynamic form control for editable fields in the table
   * @param pageSize
   * @returns
   */
  getFrmGrp(pageSize: any, dataList: any[]) {
    let formControls: any = {};
    for (let row = 0; row < pageSize; row++) {
      for (let column = 0; column < this.displayedColumns.length; column++) {
        let columnName = this.displayedColumns[column].name;
        formControls[columnName + row + column] = new FormControl({
          value: dataList[row][columnName],
          disabled: this.displayedColumns[column].disableEdit,
        });
        this.controlIndex[dataList[row][this.fcm] + column] =
          columnName + row + column;
      }
    }

    return formControls;
  }
  /**
   * Update respective form control value in datatable
   * @param columnName
   * @param colIndex
   * @param i
   */
  onValueChange(columnName: any, colIndex: number, i: number) {
    let index = i + this.paginator?.pageSize * this.paginator?.pageIndex;
    const value =
      this.tableFromGroup.controls[
        this.controlIndex[this.dataList[index][this.fcm] + colIndex]
      ].value;
    this.dataList[index][columnName] = value;
  }
  /**
   * upload csv file and assign its data to mat-Table
   * @param files
   */
  uploadCSV(files: any) {
    this.importService
      .uploadCSV(files)
      .then((result: any) => {
        this.dataList = result;
        this.getFirstColName(); // Id
        this.tableFromGroup = this.fb.group(
          this.getFrmGrp(this.paginator.pageSize, this.dataList)
        );
        this.passDataToDataSource(this.dataList, this.paginator);
        this.isHidden = false;
      })
      .catch((error) => console.log(error));
  }
  /**
   * Tracks by fn
   * @param index
   * @param item
   * @returns
   */
  trackByFn(index: any, item: any) {
    return index;
  }
  /**
   * Pass data to data source
   * @param data
   * @param paginator
   */
  passDataToDataSource(data: any[], paginator: MatPaginator) {
    this.dataSource.data = data;
    this.dataSource.paginator = paginator;
  }
  /**
   * Handles page event
   * @param event
   */
  handlePageEvent(event: PageEvent) {
    let count = event.pageSize * (event.pageIndex + 1);
    if (count > event.length) {
      count = event.length;
      this.tableFromGroup = this.fb.group(this.getFrmGrp(count, this.dataList));
    } else {
      this.tableFromGroup = this.fb.group(this.getFrmGrp(count, this.dataList));
    }
  }
  /**
   * Opens dialog
   * @param action
   * @param obj
   */
  openDialog(action: any, obj: IElements) {
    obj.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      data: obj,
    });
    dialogRef.afterClosed().subscribe((result) => {
      let data = result?.data;
      if (data) {
        this.addRowData(result.data);
      }
    });
  }
  /**
   * Adds row data
   * @param row_obj
   */
  addRowData(row_obj: IElements) {
    this.dataList.push({
      Id: (this.dataList.length + 1).toFixed(),
      Artikelname: row_obj.Artikelname,
      Bein: row_obj.Bein,
      Beschreibung: row_obj.Beschreibung,
      Bildname: row_obj.Bildname,
      Geschlecht: row_obj.Geschlecht,
      Grammatur: row_obj.Grammatur,
      Hauptartikelnr: row_obj.Hauptartikelnr,
      Hersteller: row_obj.Hersteller,
      Herstellung: row_obj.Herstellung,
      Kragen: row_obj.Kragen,
      Material: row_obj.Material,
      Materialangaben: row_obj.Materialangaben,
      Produktart: row_obj.Produktart,
      Taschenart: row_obj.Taschenart,
      Ursprungsland: row_obj.Ursprungsland,
      Aermel: row_obj.Aermel,
    });
    this.passDataToDataSource(this.dataList, this.paginator);
    this.tableFromGroup = this.fb.group(
      this.getFrmGrp(this.dataList.length, this.dataList)
    );
    this.table.renderRows();
  }
  /**
   * Exports excel
   */
  exportExcel() {
    const data = this.dataList.map((obj) => {
      return {
        Artikelname: obj.Artikelname ? obj.Artikelname : "",
        Bildname: obj.Bildname ? obj.Bildname : "",
        Geschlecht: obj.Geschlecht ? obj.Geschlecht : "",
        Grammatur: obj.Grammatur ? obj.Grammatur : "",
        Hauptartikelnr: obj.Hauptartikelnr ? obj.Hauptartikelnr : "",
        Hersteller: obj.Hersteller ? obj.Hersteller : "",
        Herstellung: obj.Herstellung ? obj.Herstellung : "",
        Kragen: obj.Kragen ? obj.Kragen : "",
        Material: obj.Material ? obj.Material : "",
        Produktart: obj.Produktart ? obj.Produktart : "",
        Aermel: obj.Aermel ? obj.Aermel : "",
        Beschreibung: obj.Beschreibung ? obj.Beschreibung : "",
        Materialangaben: obj.Materialangaben ? obj.Materialangaben : "",
        Taschenart: obj.Taschenart ? obj.Taschenart : "",
        Bein: obj.Bein ? obj.Bein : "",
        Ursprungsland: obj.Ursprungsland ? obj.Ursprungsland : "",
      };
    });
    this.exportService.exportExcel(data);
  }
  /**
  * Navigation to chart
  */
  navChart(): void {
    this._router.navigate(["/chart"]);
  }
  /**
   * Applys filter
   * @param event 
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

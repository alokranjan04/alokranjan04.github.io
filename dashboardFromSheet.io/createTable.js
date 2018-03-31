
function createTableFromJSON(jsonElementArray) {

        // EXTRACT VALUE FOR HTML HEADER. 
        // ('Book ID', 'Book Name', 'Category' and 'Price')
        var col = [];
        for (var i = 0; i < jsonElementArray.length; i++) {
            for (var key in jsonElementArray[i]) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }

        // CREATE DYNAMIC TABLE.
        var table = document.createElement("table");
        
            table.setAttribute("id","tableData");
            table.setAttribute("class","table table-striped table-bordered");
            
        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.


        var thead = document.createElement("thead");
                 
                
                
        table.appendChild(thead);        
   
        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i <  jsonElementArray.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = jsonElementArray[i][col[j]];
            }
        }

      
                
        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
        var divContainer = document.getElementById("showData");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);
             
        var trThead = document.createElement("tr");
      //  var thThead = document.createElement("th");
                
        for (var i = 0; i < col.length; i++) {
            var thThead = document.createElement("th");      // TABLE HEADER.
            thThead.innerHTML = col[i];
            trThead.appendChild(thThead);
        }
                
                
        trThead.appendChild(thThead);
        document.querySelector("thead").appendChild(trThead);        
                
                
          var newtable = $('#tableData').DataTable({
                lengthChange: false,
                buttons: [ 'excel', 'pdf', 'colvis' ]
            });

            newtable.buttons().container().appendTo( ' .col-sm-6:eq(0)' );        
             
                
    }
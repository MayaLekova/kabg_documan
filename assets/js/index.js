function generate_row($row_element, row_data) {
    $($row_element.children()[1]).html(new Date(row_data.createdAt).toDateString());

    var link = $('<a></a>').attr('href', '/get_document/' + row_data.path).html(row_data.path);
    $($row_element.children()[0]).append(link);
}

$('#docs-table').simple_datagrid(
  {
    order_by: true,
    on_generate_tr: generate_row
  }
).bind(
  'datagrid.load_data',
  function(data) {
  	console.log('Data is loaded');
    // Data is loaded
  }
);

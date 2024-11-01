jQuery(document).ready(function () {

	function renameColumn(columnKey, callback) {
		var $columnVisibilityItem = jQuery('.modal-columns-visibility .vgse-sorter .js-column-key[value="' + columnKey + '"]').parent();
		var originalTitle = $columnVisibilityItem.find('.js-column-title').val();
		var newTitle = prompt(vgse_editor_settings.texts.enter_column_name, originalTitle);

		if (newTitle === null || newTitle === originalTitle) {
			return true;
		}
		jQuery.post(ajaxurl, {
			action: 'vgse_rename_column',
			nonce: jQuery('.modal-columns-visibility input[name="wpsecv_nonce"]').val(),
			post_type: jQuery('.modal-columns-visibility input[name="wpsecv_post_type"]').val(),
			column_key: columnKey,
			new_title: newTitle,
		}, function (response) {
		});

		if (typeof hot !== 'undefined') {
			var columnIndex = hot.propToCol(columnKey);
			var existingHeaders = hot.getSettings().colHeaders;

			existingHeaders[columnIndex] = newTitle;
			hot.updateSettings({
				colHeaders: existingHeaders
			});
		}
		$columnVisibilityItem.find('.js-column-title').val(newTitle);
		$columnVisibilityItem.find('.column-title').text(newTitle);

		if (typeof callback === 'function') {
			callback();
		}

		return false;
	}

	jQuery('body').on('click', '.modal-columns-visibility   .rename-column', function (e) {
		e.preventDefault();
		var $button = jQuery(this);
		var columnKey = $button.parent().find('.js-column-key').val();

		renameColumn(columnKey);
		return false;
	});

// Allow to rename columns from contextual menu

	if (typeof hot === 'undefined' || !jQuery('.modal-columns-visibility').length) {
		return true;
	}
	/**
	 * Disable post status cells that contain readonly statuses.
	 * ex. scheduled posts
	 */
	var contextMenu = hot.getSettings().contextMenu;
	if (typeof contextMenu.items === 'undefined') {
		contextMenu.items = {};
	}
	contextMenu.items.wpse_rename_column = {
		name: vgse_editor_settings.texts.enter_column_name,
		hidden: function () {
			if (!hot.getSelected()) {
				return true;
			}
			var columnKey = hot.colToProp(hot.getSelected()[0][1]);
			var columnSettings = vgse_editor_settings.final_spreadsheet_columns_settings[columnKey];
			return columnSettings && !columnSettings.allow_to_rename;
		},
		callback: function (key, selection, clickEvent) {
			console.log(key);

			var columnKey = hot.colToProp(selection[0].start.col);
			renameColumn(columnKey);
		}
	};
	hot.updateSettings({
		contextMenu: contextMenu
	});
});


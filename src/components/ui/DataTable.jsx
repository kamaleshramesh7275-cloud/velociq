import React from 'react';

/**
 * Automotive Data Table Component
 * Striped rows, crisp borders, and mono tabular alignments
 */
export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No vehicle telemetry records available.',
  className = '',
}) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-line bg-white shadow-xs ${className}`}>
      <table className="w-full text-left border-collapse text-xs font-mono">
        <thead>
          <tr className="border-b border-line bg-bg-sunken text-text-lo">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-2.5 px-3 font-display uppercase font-bold text-[11px] tracking-wider ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/60">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-text-lo">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[keyField] || rowIdx}
                className={`hover:bg-slate-50 transition-colors ${
                  rowIdx % 2 === 1 ? 'bg-bg-sunken/40' : 'bg-white'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-2.5 px-3 text-text-hi tabular-nums ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(row[col.field], row) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

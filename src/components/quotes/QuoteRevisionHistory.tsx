import React from 'react';
import { format } from 'date-fns';
import { QuoteHistory } from '../../types/quote';

interface QuoteRevisionHistoryProps {
  history: QuoteHistory[];
}

const QuoteRevisionHistory: React.FC<QuoteRevisionHistoryProps> = ({ history }) => {
  const groupedHistory = history.reduce((acc, item) => {
    const version = item.version;
    if (!acc[version]) {
      acc[version] = [];
    }
    acc[version].push(item);
    return acc;
  }, {} as Record<number, QuoteHistory[]>);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">改訂履歴</h3>
      
      <div className="border rounded-lg divide-y">
        {Object.entries(groupedHistory)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([version, items]) => {
            const firstItem = items[0];
            return (
              <div key={version} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      バージョン {version}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(firstItem.changed_at), 'yyyy/MM/dd HH:mm')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    更新者: {firstItem.changed_by_name}
                  </span>
                </div>

                <div className="pl-4 border-l-2 border-indigo-500">
                  <p className="text-sm font-medium text-gray-900">
                    改訂理由: {firstItem.revision_reason}
                  </p>
                  {firstItem.revision_notes && (
                    <p className="mt-1 text-sm text-gray-500">
                      改訂内容: {firstItem.revision_notes}
                    </p>
                  )}
                  
                  <div className="mt-2 space-y-1">
                    {items.map((item, index) => (
                      <p key={index} className="text-sm text-gray-500">
                        • {item.field_name}: {item.previous_value} → {item.new_value}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default QuoteRevisionHistory;
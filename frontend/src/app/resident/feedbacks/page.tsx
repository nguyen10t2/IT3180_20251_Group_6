'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  DataTable,
  SearchInput,
  Loading,
  StatusBadge,
  Badge,
  Modal,
  Pagination,
  Button,
  Textarea,
} from '@/components/ui';
import { feedbackService } from '@/services';
import { QUERY_KEYS } from '@/config/constants';
import { formatDate } from '@/utils/helpers';
import { FEEDBACK_TYPE_LABELS } from '@/utils/labels';
import type { Feedback, FeedbackWithRelations, FeedbackCommentWithUser, TableColumn } from '@/types';
import { Send } from 'lucide-react';

export default function ResidentFeedbacksPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<string>('created_at');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const [selectedFeedback, setSelectedFeedback] = React.useState<FeedbackWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');

  const queryClient = useQueryClient();

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.residentFeedbacks],
    queryFn: feedbackService.getResidentFeedbacks,
    staleTime: 30000,
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { feedbackId: string; content: string }) =>
      feedbackService.addComment(data.feedbackId, data.content, 'resident'),
    onSuccess: async () => {
      if (selectedFeedback) {
        const updated = await feedbackService.getResidentFeedbackById(selectedFeedback.id);
        setSelectedFeedback(updated);
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.residentFeedbacks] });
      setCommentText('');
    },
  });

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return feedbacks;
    const lowerSearch = searchTerm.toLowerCase();
    return feedbacks.filter((f) =>
      f.title.toLowerCase().includes(lowerSearch) ||
      f.content.toLowerCase().includes(lowerSearch)
    );
  }, [feedbacks, searchTerm]);

  const sortedData = React.useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aValue = a[sortField as keyof Feedback];
      const bValue = b[sortField as keyof Feedback];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = React.useCallback((field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField, sortOrder]);

  const handleRowClick = React.useCallback(async (feedback: Feedback) => {
    setIsModalOpen(true);
    setIsLoadingDetail(true);
    try {
      const detail = await feedbackService.getResidentFeedbackById(feedback.id);
      setSelectedFeedback(detail);
    } catch (error) {
      console.error('Failed to fetch feedback detail:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const handleSendComment = React.useCallback(() => {
    if (!selectedFeedback || !commentText.trim()) return;
    addCommentMutation.mutate({
      feedbackId: selectedFeedback.id,
      content: commentText,
    });
  }, [selectedFeedback, commentText, addCommentMutation]);

  const columns: TableColumn<Feedback>[] = [
    { key: 'title', label: 'Tiêu đề', sortable: true, width: '30%' },
    {
      key: 'type',
      label: 'Loại',
      render: (value) => (
        <Badge variant="outline">
          {FEEDBACK_TYPE_LABELS[value as keyof typeof FEEDBACK_TYPE_LABELS] || value}
        </Badge>
      ),
    },
    { key: 'priority', label: 'Ưu tiên', render: (value) => <StatusBadge status={String(value)} type="priority" /> },
    { key: 'status', label: 'Trạng thái', sortable: true, render: (value) => <StatusBadge status={String(value)} type="feedback" /> },
    { key: 'created_at', label: 'Ngày gửi', sortable: true, render: (value) => formatDate(String(value)) },
  ];

  if (isLoading) {
    return <Loading text="Đang tải phản ánh..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Phản ánh của tôi</h1>
        <p className="text-muted-foreground mt-1">Gửi và theo dõi các phản ánh, kiến nghị</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Danh sách phản ánh ({feedbacks.length})</CardTitle>
            <SearchInput
              placeholder="Tìm kiếm phản ánh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-80"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedData}
            columns={columns}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
            onRowClick={handleRowClick}
          />
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Chi tiết phản ánh" size="lg">
        {isLoadingDetail ? (
          <Loading text="Đang tải chi tiết..." />
        ) : selectedFeedback ? (
          <div className="space-y-6">
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedFeedback.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Ngày gửi: {formatDate(selectedFeedback.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={selectedFeedback.priority} type="priority" />
                  <StatusBadge status={selectedFeedback.status} type="feedback" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Nội dung</label>
                <p className="mt-1 whitespace-pre-wrap">{selectedFeedback.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại phản ánh</label>
                  <Badge variant="outline" className="mt-1">
                    {FEEDBACK_TYPE_LABELS[selectedFeedback.type as keyof typeof FEEDBACK_TYPE_LABELS] || selectedFeedback.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phòng</label>
                  <p className="mt-1">{selectedFeedback.house?.room_number || '-'}</p>
                </div>
              </div>

              {selectedFeedback.assigned_to && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Người xử lý</label>
                  <p className="mt-1">{selectedFeedback.assignee?.full_name || 'Đang chờ phân công'}</p>
                </div>
              )}

              {selectedFeedback.resolved_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Thời gian giải quyết</label>
                  <p className="mt-1">{formatDate(selectedFeedback.resolved_at)}</p>
                </div>
              )}

              {selectedFeedback.resolution_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Kết quả xử lý</label>
                  <div className="mt-1 p-3 bg-green-50 rounded-md">
                    <p className="whitespace-pre-wrap">{selectedFeedback.resolution_notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-3">Trao đổi ({selectedFeedback.comments?.length || 0})</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {selectedFeedback.comments && selectedFeedback.comments.length > 0 ? (
                  selectedFeedback.comments.map((comment: FeedbackCommentWithUser) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-sm">{comment.user?.full_name || 'Unknown'}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Chưa có trao đổi nào</p>
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Nhập nội dung trao đổi..."
                  className="flex-1 min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                />
                <Button
                  onClick={handleSendComment}
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

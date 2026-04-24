import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SortIcon from '@mui/icons-material/Sort';

const DEFAULT_SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'name-asc', label: 'Name (A-Z)' },
  { id: 'name-desc', label: 'Name (Z-A)' },
];

/**
 * SortMenu 컴포넌트
 *
 * 정렬 기준을 선택하는 드롭다운 버튼.
 *
 * 동작 흐름:
 * 1. 사용자가 버튼을 클릭하면 선택 가능한 정렬 옵션 메뉴가 열린다
 * 2. 메뉴에서 옵션을 선택하면 onChange 콜백이 호출되고 메뉴가 닫힌다
 * 3. 버튼 라벨은 현재 선택된 옵션의 label로 표시 — 옵션이 없으면 'Sort'로 폴백
 *
 * Props:
 * @param {string} value - 현재 선택된 옵션 id [Required]
 * @param {function} onChange - (id) => void, 옵션 선택 시 호출 [Required]
 * @param {Array<{id: string, label: string}>} options - 표시할 정렬 옵션 [Optional, 기본값: 최신/오래된/이름 A-Z/이름 Z-A]
 * @param {string} size - 버튼 크기 (MUI Button size) [Optional, 기본값: 'small']
 * @param {object} sx - 버튼 추가 스타일 [Optional]
 *
 * Example usage:
 * <SortMenu value={ sortBy } onChange={ setSortBy } />
 */
export function SortMenu({
  value,
  onChange,
  options = DEFAULT_SORT_OPTIONS,
  size = 'small',
  sx,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = useCallback((event) => setAnchorEl(event.currentTarget), []);
  const handleClose = useCallback(() => setAnchorEl(null), []);
  const handleSelect = useCallback(
    (id) => {
      onChange?.(id);
      setAnchorEl(null);
    },
    [onChange],
  );

  const current = options.find((opt) => opt.id === value);

  return (
    <>
      <Button
        variant="outlined"
        size={ size }
        startIcon={ <SortIcon /> }
        onClick={ handleOpen }
        sx={ {
          textTransform: 'none',
          borderColor: 'divider',
          color: 'text.secondary',
          ...sx,
        } }
      >
        { current?.label || 'Sort' }
      </Button>
      <Menu anchorEl={ anchorEl } open={ Boolean(anchorEl) } onClose={ handleClose }>
        { options.map((option) => (
          <MenuItem
            key={ option.id }
            selected={ option.id === value }
            onClick={ () => handleSelect(option.id) }
          >
            { option.label }
          </MenuItem>
        )) }
      </Menu>
    </>
  );
}

# 99. Backlog

프론트엔드 구조 개선 및 기능 추가 후보 (백엔드 작업과 무관, 우선순위순).

## 1. 업체 등록/수정 폼 공용 컴포넌트 추출

`merchant/register/page.tsx`와 `merchant/[id]/edit/page.tsx`가 업체명·전화번호·업체유형(버튼 그룹) 입력 필드를 거의 동일하게 중복 작성하고 있다. 폼 스키마(`merchantSchema`)와 옵션(`MERCHANT_TYPE_OPTIONS`)도 이미 공유 중이라 필드 마크업만 뽑아내면 된다.

**방향**: `register`/`useForm` 관련 값을 props로 받는 `MerchantForm` 공용 컴포넌트를 만들어 두 페이지에서 재사용하고, 각 페이지는 데이터 로드·제출 로직만 담당하도록 정리.

## 2. 로딩 스켈레톤 공용 컴포넌트 추출

`animate-pulse` 스켈레톤 블록이 13개 페이지에 24곳 반복돼 있다. 페이지마다 개수·높이만 다를 뿐 구조(`space-y-3` 컨테이너 + 반복되는 `rounded-2xl bg-gray-100 animate-pulse` div)는 동일하다.

**방향**: `<SkeletonList count height className />` 같은 공용 컴포넌트로 추출해 각 페이지의 로딩 블록을 교체.

import {
  CreateReservationPayload,
  ReservationStock,
  StockDisponibleReservation,
} from '../types/reservation.type';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      Array.isArray(data?.message)
        ? data.message.join(' | ')
        : data?.message || 'Erreur serveur';

    throw new Error(message);
  }

  return data as T;
}

export async function getReservations(): Promise<ReservationStock[]> {
  const response = await fetch(`${API_URL}/reservations`, {
    cache: 'no-store',
  });

  return handleResponse<ReservationStock[]>(response);
}

export async function getStockDisponiblePourReservation(): Promise<
  StockDisponibleReservation[]
> {
  const response = await fetch(`${API_URL}/reservations/stock-disponible`, {
    cache: 'no-store',
  });

  return handleResponse<StockDisponibleReservation[]>(response);
}

export async function createReservation(
  payload: CreateReservationPayload,
): Promise<ReservationStock> {
  const response = await fetch(`${API_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<ReservationStock>(response);
}

export async function annulerReservation(
  idReservationStock: number,
): Promise<ReservationStock> {
  const response = await fetch(
    `${API_URL}/reservations/${idReservationStock}/annuler`,
    {
      method: 'PATCH',
    },
  );

  return handleResponse<ReservationStock>(response);
}

export async function deleteReservation(
  idReservationStock: number,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/reservations/${idReservationStock}`,
    {
      method: 'DELETE',
    },
  );

  await handleResponse<void>(response);
}
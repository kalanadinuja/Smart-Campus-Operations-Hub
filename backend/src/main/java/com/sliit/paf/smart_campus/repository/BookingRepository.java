package com.sliit.paf.smart_campus.repository;

import com.sliit.paf.smart_campus.model.Booking;
import com.sliit.paf.smart_campus.model.Booking.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByResourceIdAndDate(String resourceId, LocalDate date);

    /**
     * Find overlapping bookings for conflict detection.
     * A booking overlaps if it's for the same resource and date,
     * and the time ranges intersect, and it's not cancelled/rejected.
     */
    @Query("{'resourceId': ?0, 'date': ?1, 'status': {$in: ['PENDING', 'APPROVED']}, " +
           "'startTime': {$lt: ?3}, 'endTime': {$gt: ?2}}")
    List<Booking> findOverlapping(String resourceId, LocalDate date,
                                   LocalTime startTime, LocalTime endTime);

    List<Booking> findByResourceIdAndDateBetween(String resourceId, LocalDate start, LocalDate end);
    List<Booking> findByDateBetween(LocalDate start, LocalDate end);
    void deleteByUserId(String userId);
}

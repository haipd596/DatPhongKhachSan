package com.rexhotel.booking.config;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

/**
 * Rate limiter don gian dung sliding window voi ConcurrentHashMap.
 * Khong can them dependency ngoai.
 */
@Service
public class RateLimitService {

    private final Map<String, Deque<Long>> windowMap = new ConcurrentHashMap<>();

    /**
     * @param key       khoa dinh danh (vd: "forgot:user@email.com")
     * @param maxCalls  so lan toi da trong khoang thoi gian
     * @param windowSec khoang thoi gian tinh theo giay
     * @return true neu duoc phep, false neu vuot gioi han
     */
    public synchronized boolean tryAcquire(String key, int maxCalls, long windowSec) {
        long now = System.currentTimeMillis();
        long windowMs = windowSec * 1000L;
        Deque<Long> timestamps = windowMap.computeIfAbsent(key, k -> new ArrayDeque<>());
        // Loai bo cac timestamp cu hon window
        while (!timestamps.isEmpty() && (now - timestamps.peekFirst()) > windowMs) {
            timestamps.pollFirst();
        }
        if (timestamps.size() >= maxCalls) {
            return false;
        }
        timestamps.addLast(now);
        return true;
    }
}

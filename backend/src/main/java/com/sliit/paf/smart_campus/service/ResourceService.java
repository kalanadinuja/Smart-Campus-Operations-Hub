package com.sliit.paf.smart_campus.service;

import com.sliit.paf.smart_campus.dto.request.ResourceRequest;
import com.sliit.paf.smart_campus.dto.response.ResourceResponse;
import com.sliit.paf.smart_campus.exception.ResourceNotFoundException;
import com.sliit.paf.smart_campus.model.Resource;
import com.sliit.paf.smart_campus.model.Resource.ResourceStatus;
import com.sliit.paf.smart_campus.model.Resource.ResourceType;
import com.sliit.paf.smart_campus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for campus resource management (CRUD + search/filter).
 */
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    /** Get all resources with optional filters */
    public List<ResourceResponse> getAllResources(String type, String status,
                                                   Integer minCapacity, String location) {
        List<Resource> resources;

        if (type != null && status != null) {
            resources = resourceRepository.findByTypeAndStatus(
                    ResourceType.valueOf(type), ResourceStatus.valueOf(status));
        } else if (type != null) {
            resources = resourceRepository.findByType(ResourceType.valueOf(type));
        } else if (status != null) {
            resources = resourceRepository.findByStatus(ResourceStatus.valueOf(status));
        } else if (minCapacity != null) {
            resources = resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        } else if (location != null) {
            resources = resourceRepository.findByLocationContainingIgnoreCase(location);
        } else {
            resources = resourceRepository.findAll();
        }

        return resources.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Get a single resource by ID */
    public ResourceResponse getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
        return toResponse(resource);
    }

    /** Create a new resource (Admin only) */
    public ResourceResponse createResource(ResourceRequest request) {
        Resource resource = new Resource();
        resource.setName(request.getName());
        resource.setType(ResourceType.valueOf(request.getType()));
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setStatus(request.getStatus() != null ?
                ResourceStatus.valueOf(request.getStatus()) : ResourceStatus.ACTIVE);

        if (request.getAvailabilityWindows() != null) {
            List<Resource.TimeRange> windows = request.getAvailabilityWindows().stream()
                    .map(w -> new Resource.TimeRange(w.getDayOfWeek(), w.getStartTime(), w.getEndTime()))
                    .collect(Collectors.toList());
            resource.setAvailabilityWindows(windows);
        }

        resource.setCreatedAt(Instant.now());
        resource.setUpdatedAt(Instant.now());
        Resource saved = resourceRepository.save(resource);
        return toResponse(saved);
    }

    /** Update an existing resource (Admin only) */
    public ResourceResponse updateResource(String id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));

        resource.setName(request.getName());
        resource.setType(ResourceType.valueOf(request.getType()));
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            resource.setStatus(ResourceStatus.valueOf(request.getStatus()));
        }

        if (request.getAvailabilityWindows() != null) {
            List<Resource.TimeRange> windows = request.getAvailabilityWindows().stream()
                    .map(w -> new Resource.TimeRange(w.getDayOfWeek(), w.getStartTime(), w.getEndTime()))
                    .collect(Collectors.toList());
            resource.setAvailabilityWindows(windows);
        }

        resource.setUpdatedAt(Instant.now());
        Resource saved = resourceRepository.save(resource);
        return toResponse(saved);
    }

    /** Delete a resource (Admin only) */
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with ID: " + id);
        }
        resourceRepository.deleteById(id);
    }

    /** Convert entity to response DTO */
    private ResourceResponse toResponse(Resource resource) {
        ResourceResponse response = new ResourceResponse();
        response.setId(resource.getId());
        response.setType(resource.getType().name());
        response.setName(resource.getName());
        response.setCapacity(resource.getCapacity());
        response.setLocation(resource.getLocation());
        response.setDescription(resource.getDescription());
        response.setStatus(resource.getStatus().name());
        response.setCreatedAt(resource.getCreatedAt());
        response.setUpdatedAt(resource.getUpdatedAt());

        if (resource.getAvailabilityWindows() != null) {
            List<ResourceResponse.TimeRangeResponse> windows = resource.getAvailabilityWindows().stream()
                    .map(w -> new ResourceResponse.TimeRangeResponse(
                            w.getDayOfWeek(), w.getStartTime(), w.getEndTime()))
                    .collect(Collectors.toList());
            response.setAvailabilityWindows(windows);
        } else {
            response.setAvailabilityWindows(new ArrayList<>());
        }

        return response;
    }
}

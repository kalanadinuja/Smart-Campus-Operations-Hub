package com.sliit.paf.smart_campus.repository;

import com.sliit.paf.smart_campus.model.Resource;
import com.sliit.paf.smart_campus.model.Resource.ResourceStatus;
import com.sliit.paf.smart_campus.model.Resource.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByCapacityGreaterThanEqual(int minCapacity);
    List<Resource> findByLocationContainingIgnoreCase(String location);
    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);
}
